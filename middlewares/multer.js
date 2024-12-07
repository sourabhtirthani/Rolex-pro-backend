import multer, { diskStorage } from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // const originalExtension = file.originalname.split('.').pop();
    // const filename = file.originalname.endsWith(originalExtension) ? file.originalname : file.originalname + `.${originalExtension}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  }
});

export const upload = multer({ 
    storage,
    fileFilter : function(req, file, callback){
        if(file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png"){
            callback(null, true);
        }else{
            callback(null, false)
        }
    }
});
