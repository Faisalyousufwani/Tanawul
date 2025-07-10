import multer from "multer";
import path from "path"
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename=fileURLToPath(import.meta.url)
const __dirname=dirname(__filename)

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'../uploads'))
    },
    filename:(req,file,cb)=>{
        const uniqueSuffix=Date.now()+'_'+Math.round(Math.random()*1e9)
        const ext=path.extname(file.originalname);
        cb(null,`${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`)
    }
})

const fileFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image/')){
        cb(null,true)
    }else{
        cb(new Error('only image files are allowed'),false)
    }

}
 const upload=multer({storage,fileFilter})
 export default upload