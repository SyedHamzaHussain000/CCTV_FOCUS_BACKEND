const mongoose = require('mongoose');


const Connect_DB = () => {

    mongoose.connect(process.env.DB_CONNECT_URL)
      .then(() => console.log('DB Connected!'))
      .catch((error)=> console.log('Error connecting', error))
} 

module.exports = Connect_DB;
