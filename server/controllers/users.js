var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = {

	index: function(req,res){
		console.log("cookies",req.cookies);
		console.log("===============");
		console.log("session",req.session);
		User.find({}, function(err,users){
			if(err){
				return res.json(err);
			}
			return res.json(users);
		})
	},

	create: function(req,res) {
		console.log(req.body)
		// var user = new User(req.body);
		User.create(req.body, function(err,user){
			if(err){
				return res.json(err);
			}

			// destroy session in the factory?
			if(req.session.user){
				req.session.destroy();
			}
			else{
				req.session.user=user;
			}
			console.log(req.session.user);
			return res.json(user);
		})
	},


	// validate on the client controller side; data in req.body
	login: function(req,res){
		// look up the email and return an object
		User.findOne({email: req.body.email}, function(err,user){
			if(err){
				return res.json(err);
			}
			console.log('user: ', user)

			// check for null, and authenticate the password
			if(user && user.authenticate(req.body.password)){
				if(!req.session.user){
					req.session.user = user;
					console.log("session",req.session.user);
				}
				return res.json(req.session.user);
			}

			// bad credentials
			return res.json({
				"errors": {
					"password": {
						"message" : "Invalid credentials."
					}
				}
			})
		})
	},
	// req.session = {};
	logout: function(req,res){
		req.session.user=null;
		return res.json(req.session.user);
	},

	session : function(req,res){
		console.log("user session",req.session.user)
		if(!req.session.user) {
			return res.json({ "error": false })
		}
		else {
			console.log(req.session.user._id,"server session")
			return res.json(req.session.user);
		}
	},

	addFriend: function(req,res){
		// console(req.body);
		User.findByIdAndUpdate(req.session.user._id,{$push:{"friends":req.params.id}},{new:true},function(err,user){
			if(err){
				return res.json(err);
			}
			return res.json(user);
		})
		// return res.json(user);
	},

	deleteFriend: function(req,res){
		// console(req.body);
		User.findByIdAndUpdate(req.session.user._id,{$pull:{"friends":req.params.id}},{new:true},function(err,user){
			if(err){
				return res.json(err);
			}
			return res.json(user);
		})
		
	}
};