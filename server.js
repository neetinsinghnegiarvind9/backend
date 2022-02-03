const express = require('express');
const app = express();
const mongoose =  require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/user')
const bcrypt = require('bcrypt')


const port=  process.env.PORT || 8080;

//middleware
app.use(express.json());
app.use(cors());

//mongodb database connected
const db = 'mongodb+srv://mern:vv4MwhWs5nHZeHrH@cluster0.nmnil.mongodb.net/NewUser?retryWrites=true&w=majority';
mongoose.connect(db,() => {
	console.log('Mongodb database connected')
})

//routes 
//register route
app.post('/api/register',async(req,res) => {
	console.log(req.body)
	try{
         const newPassword = await bcrypt.hash(req.body.password,10)
         await User.create({
         	firstName: req.body.firstName,
         	lastName: req.body.lastName,
         	email : req.body.email,
         	password : newPassword,
         	phoneNumber: req.body.phoneNumber
         })
         res.json({status : 'ok'})
	}catch(err){
		res.json({status: 'error',error: 'Duplicate email or phoneNumber'})
	}
})

//login route
app.post('/api/login',async(req,res) => {
	const user = await User.findOne({
		email : req.body.email,
	})
	if(!user){
		return{status : 'error',error: 'Invalid login'}
	}

	const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
		)

	if(isPasswordValid){
		const token = jwt.sign(
		{
			name: user.name,
			email: user.email
		},
         'secret123'
		)
		return res.json({ status : 'ok',user: token})
	}else{
		return res.json({ status : 'error', user: false})
	}
})

//get the user information
//get a user

app.get('/api/:id',async(req,res) => {
	User.findById(req.params.id)
	       .then(user => res.json(user))
	       .catch(err => res.status(400).json(err))
})

app.listen(port,()=> {
	console.log(`Server is running at port ${port}`)
})