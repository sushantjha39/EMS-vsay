import SMS from 'SMS';
import Leave from '../models/leave.js';
import User from '../models/user.js';

// Initialize SMS client
const smsClient = new SMS({
  apiKey: process.env.SMS_API_KEY,
  apiSecret: process.env.SMS_API_SECRET
});

export const processSMSLeave = async (req, res) => {
  try {
    const { Body, From } = req.body;
    const [command, startDate, endDate, reason] = Body.split('|');
    
    if (command.toLowerCase() !== 'leave') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid command format' 
      });
    }

    // Find user by phone number
    const user = await User.findOne({ phone: From });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Create leave record
    const newLeave = new Leave({
      employee: user._id,
      startDate,
      endDate,
      reason,
      leaveType: 'sms'
    });

    await newLeave.save();

    // Send confirmation SMS
    await smsClient.send({
      phoneNumber: From,
      text: `Your leave application from ${startDate} to ${endDate} has been received. Reason: ${reason}`
    });

    res.status(201).json({ 
      success: true,
      message: 'Leave application submitted successfully via SMS',
      data: newLeave
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process SMS leave application' 
    });
  }
};

export const getSMSLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ leaveType: 'sms' })
      .populate('employee', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true,
      data: leaves 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch SMS leave applications' 
    });
  }
};
