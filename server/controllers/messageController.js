import dotenv from "dotenv";
dotenv.config();
import Chat from "../models/Chat.js";
import axios from "axios";
import User from "../models/User.js";
import imageKit from "../config/imageKit.js";

export const textMsgController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    //  Find the chat for this user
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    //  Save the user message in DB
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Send request to OpenRouter (Gemini 2.0 Flash Experimental free)
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-0528:free",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    //  Extract model’s reply
    const botReply = response.data.choices[0].message.content;

      const reply = {
      role: "assistant",
      content: botReply,
      timestamp: Date.now(),
      isImage: false,
      
    }
    //  Save assistant message in DB
    chat.messages.push({
      role: "assistant",
      content: botReply,
      timestamp: Date.now(),
      isImage: false,
    });

    await chat.save();

    await User.updateOne({_id: userId}, {$inc : {credits : -1}})

    // Send back response
    return res.json({
      success: true,
      // reply: botReply,
      reply,
    });
  } catch (error) {
    console.error("Error in textMsgController:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong with AI request",
    });
  }
};

export const imageMsgController = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if(req.user.credits < 1){
      return res.json({success: false , message : 'You dont have enough credits for this feature'})
    }
    const { chatId, prompt , isPublished } = req.body;
    // 1️⃣ Find the chat for this user
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // 2️⃣ Save the user message in DB
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const encodedPrompt = encodeURIComponent(prompt)

    const generatedImageUrl = `${process.env.IMAGEKIT_ENDPOINT_URL}/
    ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,
    h-800`

    const aiImageResponse = await axios.get(generatedImageUrl,{responseType:'arraybuffer'})

    const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString('base64')}`

    const uploadResponse = await imageKit.upload({
      file : base64Image,
      fileName : `${Date.now()}.png`,
      folder : 'quickgpt'
    })
    // // 3️⃣ Send request to Hugging Face Stable Diffusion XL
    // const response = await axios.post(
    //   "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
    //   { inputs: prompt },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );

    // // 4️⃣ Extract image URL or base64
    // // Note: HF sometimes returns base64 in response.data[0].generated_image
    // let imageUrl;
    // if (response.data?.data?.[0]?.url) {
    //   imageUrl = response.data.data[0].url; // direct URL
    // } else if (response.data?.data?.[0]?.b64_json) {
    //   imageUrl = `data:image/png;base64,${response.data.data[0].b64_json}`;
    // } else {
    //   return res.status(500).json({ success: false, message: "No image generated" });
    // }
    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished
    }

    // // 5️⃣ Save assistant message in DB
    chat.messages.push(reply);

    await chat.save();

    // // 6️⃣ Deduct user credit
    await User.updateOne({ _id: userId }, { $inc: { credits: -2} });

    // // 7️⃣ Send back response
    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Error in imageMsgController:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong with image generation",
    });
  }
};