import express from 'express'
import { imageMsgController, textMsgController } from '../controllers/messageController.js'
import {protect} from '../middlewares/auth.js'

const msgRouter = express.Router()

msgRouter.post('/text',protect, textMsgController)
msgRouter.post('/image',protect,imageMsgController)

export default msgRouter