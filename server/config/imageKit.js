import ImageKit from 'imagekit'

const imageKit = new ImageKit({
    publicKey : process.env.ImageKit_Public_Key,
    privateKey : process.env.ImageKit_Private_Key,
    urlEndpoint : process.env.ImageKit_EndPoint_Url
})

export default imageKit 