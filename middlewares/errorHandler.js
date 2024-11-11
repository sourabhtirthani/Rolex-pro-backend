const errorHandler = async (error,req, res, next) => {
    console.log(error,  " is his ruuning");
    return res.status(400).send({error:error.message});    
};

export default errorHandler;