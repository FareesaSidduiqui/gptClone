import express from 'express'
import { getPublishedImage, getUser, userLogin, userReg } from '../controllers/userController.js'
import { protect } from '../middlewares/auth.js'

const router = express.Router()

router.post('/register', userReg)
router.post('/login',userLogin)
router.get('/data',protect,getUser)
router.get('/published-images',getPublishedImage)

export default router