import express from 'express'
import { login, applyLeave, getLeaveDetails, signup } from '../controllers/authController.js'

const router = express.Router()
router.post('/login', login)
router.post('/signup', signup)
router.post('/apply-leave', applyLeave)
router.get('/leave-details', getLeaveDetails)

export default router
