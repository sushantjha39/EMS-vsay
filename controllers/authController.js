import User from '../models/user.js'
import Leave from '../models/leave.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import twilio from 'twilio'

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ Success: false, error: 'User not found' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(404).json({ Success: false, error: 'Wrong Password' });
        const token = jwt.sign({ _id: user._id, role: user.role },
            process.env.JWT_KEY, { expiresIn: '1h' });
        res.status(200)
            .json({
                Success: true,
                token,
                user: { _id: user.id, name: user.name, role: user.role },
            });
    }
    catch (error) {
        console.log(error.message)
    }
}

const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason, leaveType, employeeId } = req.body;
    
    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ 
        success: false,
        error: 'End date must be after start date' 
      });
    }

    const newLeave = new Leave({
      employee: employeeId,
      startDate,
      endDate,
      reason,
      leaveType
    });

    await newLeave.save();

    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Send SMS notification to admin
    await client.messages.create({
      body: `New leave application received from ${user.name} (${user.email}) for ${leaveType} leave from ${startDate} to ${endDate}. Reason: ${reason}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.ADMIN_PHONE_NUMBER
    });

    res.status(201).json({ 
      success: true,
      message: 'Leave application submitted successfully',
      data: newLeave
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit leave application' 
    });
  }
}

const getLeaveDetails = async (req, res) => {
    try {
        const { date } = req.query;
        const leaveRecords = await Leave.find({ 
            startDate: { $lte: date },
            endDate: { $gte: date }
        }).populate('employee', 'name');

        const employeesOnLeave = leaveRecords.map(record => ({
            name: record.employee.name,
            reason: record.reason
        }));

        res.status(200).json({ 
            success: true,
            data: employeesOnLeave 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch leave details' 
        });
    }
}

const signup = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                error: 'User with this email or phone already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role
        });

        await newUser.save();

        // Return response without password
        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            createdAt: newUser.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: userResponse
        });
    } catch (error) {
        console.error(error);
        let errorMessage = 'Failed to create user';
        
        if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map(val => val.message).join(', ');
        } else if (error.code === 11000) {
            errorMessage = 'Phone number already exists';
        }
        
        res.status(500).json({ 
            success: false,
            error: errorMessage 
        });
    }
}

export { login, applyLeave, getLeaveDetails, signup }
