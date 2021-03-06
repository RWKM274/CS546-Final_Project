const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const userData = require("../data").userData;

// const data = require('../data');

const bookDataInfo = require('../data').addBooking;

const reviewDataInfo = require('../data').addReview;

const gymData = require('../data').gymData;

const xss = require('xss');



let loggedin = false

router.get('/', async (req, res) => {
     
    let user
    let owner
    if (req.session.user) {
        if (req.session.user.role == "user"){
            user = true
            owner = false
        }
        else if(req.session.user.role == "owner"){
            user = false
            owner = true
        }
        
        id = req.session.user.id
        userDetails = await userData.getUserById(id)
        
        let name = userDetails.firstName
        res.render('landing', {title: "GymStar",loggedin:true,name,landing:true})
    } else {
        res.render('landing', {title: "GymStar",loggedin:false,landing:true})
    }
    
});

router.get('/login', async (req, res) => {
    
    if (req.session.user) {
        res.redirect('/gyms')
    } else {
        let message = req.session.success
        res.render('login', {title: "Login", success:message})
    }

});

router.post('/login', async (req, res) => {

    if (req.session.user) {
        res.redirect('/gyms') 
        return
    }

    let email = xss(req.body.email)
    let password = xss(req.body.password)

    if(!email || !password) {
        res.status(400).render('login', {title: "Error", error: 'You must provide all details'})
        return
    } 

    if (typeof email != 'string' || typeof password != 'string') {
        res.status(400).render('login', {title: "Error", error: 'Input should be string'})
        return
    } 

    if (!email.replace(/\s/g, '').length || !password.replace(/\s/g, '').length) {
        res.status(400).render('login', {title: "Error", error: 'Input cannot be empty spaces'})
        return
    } 

    let regEmail = email.search(/^([a-zA-Z0-9_.+-]{1,})(@{1})([a-zA-Z]{1})([a-zA-Z0-9-]{1,})([.]{1})([a-zA-Z]{1,})$/gi);

    if (regEmail === -1) {
        res.status(400).render('login', {title: "Error", error:  'Email format not valid'})
        return
    }
    
    // if (password.length != password.replace(/\s/g, '').length) {
    //     res.status(400).render('login', {title: "Error", error: 'Password should not contain spaces'})
    //     return
    // }

    
    
    if(password.length <6) {
        res.status(400).render('login', {title: "Error", error: 'Password should atleast 6 character long'})
        return
    } 

    email = email.toLowerCase()

        
    try{
        const info = await userData.checkUser(email,password)
        
        
        // console.log(info)
        if(info.authenticated == true){
            req.session.user = {
                id:info.id,
                role:info.role,
                firstName:info.firstName,
                email:info.email
                
            }
            loggedin = true
            res.redirect('/gyms')
            // console.log(req.session.user)
            }
        else {
            res.status(500).render('login', {title: "Error", error: 'Internal Server Error'})
            }
        }
        catch(e){
            res.status(400).render('login', {title: "Error", error: e})
        }

});


router.get('/signup', async (req,res) => {
    if (req.session.user) {
        res.redirect('/gyms')
        return
    }
    else{
        res.render('signup', {title: "Signup Page"})
    }
    
});



router.post('/signup', async (req,res) => {

    if (req.session.user) {
        res.redirect('/gyms')
        return
    }

    let role = xss(req.body.role)
    let firstName = xss(req.body.firstname)
    let lastName = xss(req.body.lastname)
    let email = xss(req.body.email)
    let city = xss(req.body.city)
    let state = xss(req.body.state)
    let mobile = xss(req.body.mobile)
    let gender = xss(req.body.gender)
    let dob = xss(req.body.dob)
    let password = xss(req.body.password)
    // console.log(typeof role)
    // console.log(typeof firstName)
    // console.log(typeof lastName)
    // console.log(typeof email)
    // console.log(typeof city)
    // console.log(typeof state)
    // console.log(typeof mobile)
    // console.log(typeof gender)
    // console.log(typeof dob)
    // console.log(typeof password)

    if(!role || !email || !password || !firstName || !lastName || !gender || !city || !state || !mobile || !dob) {
        res.status(400).render('signup', {title: "Error", error: 'You must provide all details'})
        return
    } 

    if (typeof role != 'string' || typeof email != 'string' || typeof password != 'string' || typeof firstName != 'string' || typeof lastName != 'string' ||
    typeof city != 'string' || typeof state != 'string' || typeof gender != 'string' || typeof mobile != 'string' || 
    typeof dob != 'string') {
        res.status(400).render('signup', {title: "Error", error: 'Input should be string'})
        return
    } 

    if (!email.replace(/\s/g, '').length || !password.replace(/\s/g, '').length 
    || !firstName.replace(/\s/g, '').length || !lastName.replace(/\s/g, '').length
    || !role.replace(/\s/g, '').length || !city.replace(/\s/g, '').length
    || !state.replace(/\s/g, '').length || !mobile.replace(/\s/g, '').length
    || !gender.replace(/\s/g, '').length || !dob.replace(/\s/g, '').length) {
        res.status(400).render('signup', {title: "Error", error: 'Input cannot be empty spaces'})
        return
    } 

    let regMob = mobile.search(/^\d{10}$/);

    if(regMob=== -1){
        res.status(400).render('signup', {title: "Error", error:  'PhoneNumber not valid'})
        return 
    } 

    let regEmail = email.search(/^([a-zA-Z0-9_.+-]{1,})(@{1})([a-zA-Z]{1})([a-zA-Z0-9-]{1,})([.]{1})([a-zA-Z]{1,})$/gi);

    if (regEmail === -1) {
        res.status(400).render('signup', {title: "Error", error:  'Email format not valid'})
        return
    }
    
    // if (password.length != password.replace(/\s/g, '').length) {
    //     res.status(400).render('signup', {title: "Error", error: 'Password should not contain spaces'})
    //     return
    // }

    
    
    if(password.length <6) 
    {
        res.status(400).render('signup', {title: "Error", error: 'Password should atleast 6 character long'})
        return
    }

    if(role != 'user' && role != "owner") 
    {
        res.status(400).render('signup', {title: "Error", error: "Select valid role"})
        return
    } 

    if(city != "Jersey City" && city != "Hoboken") 
    {
        res.status(400).render('signup', {title: "Error", error: "Select valid city"})
        return
    } 
    
    if(state != "New Jersey" ) 
    {
        res.status(400).render('signup', {title: "Error", error: "Select valid state"})
        return
    } 

    if(gender != "male" && gender != "female" && gender != "other") 
    {
        res.status(400).render('signup', {title: "Error", error: "Select valid Gender"})
        return
    } 
    
    // let regDob = dob.search(/^(19|20)\d\d[-]([1-9]|1[012])[-]([1-9]|[12][0-9]|3[01])$/)

    // if(regDob == -1) 
    // {
    //     res.status(400).render('signup', {title: "Error", error: 'Date of birth formate not valid'})
    //     return
    // } 
    
    email = email.toLowerCase()

    try{
    const info = await userData.createUser(role,firstName,lastName,email,city,state,mobile,gender,dob, password)

    if(info.userInserted == true){
        req.session.success = "Successfully signed up, now please log in."
        res.status(200).redirect('/login')
        }
    else {
        res.status(500).render('signup', {title: "Error", error: 'Internal Server Error'})
        }
    }
    catch(e){
        res.status(400).render('signup', {title: "Error", error: e})
    }
    
    
});


router.get('/userprofile', async (req, res) => {
    
    if (!req.session.user) {
        res.redirect('/login')
    } else {
        let updateSuccess = req.session.updateSuccess
        
        let id = req.session.user.id
        //Get booking details if user
        
        let role = req.session.user.role
        if (role == "user"){

            userDetails = await userData.getUserById(id)
            
        
        userProfile = {
                id:userDetails.id,
                role:userDetails.role,
                firstName:userDetails.firstName,
                lastName:userDetails.lastName,
                email:userDetails.email,
                city:userDetails.city,
                state:userDetails.state,
                mobile:userDetails.mobile,
                gender:userDetails.gender,
                dob:userDetails.dob,
                user:true,
                owner:false
        }
        let name = userProfile.firstName
        bookDetails = await bookDataInfo.getAllOrderByUserID(req.session.user.id)
        const reviews = await reviewDataInfo.getAllReviewByUserID(id)
        console.log(bookDetails)
        for(i of bookDetails){
            i['gymId'] = i['gymId'].toString()
            gymId = i.gymId
            gymDetails = await gymData.getGym(gymId)
            gymName = gymDetails.gymName
            i['gymName'] = gymName
        }
    


        if(bookDetails !== null){
            res.render('userProfile', {reviews:reviews,title: "Profile", userProfile, user:true ,owner:false, bookDetails, loggedin, name,updateSuccess:updateSuccess})
        }
        else{
            res.render('userProfile', {reviews:reviews,title: "Profile", userProfile, user:true ,owner:false, loggedin, name,updateSuccess:updateSuccess})
        }

        

        }
        else if (role == "owner"){


            userDetails = await userData.getUserById(id)
            
            userProfile = {
                    id:userDetails.id,
                    role:userDetails.role,
                    firstName:userDetails.firstName,
                    lastName:userDetails.lastName,
                    email:userDetails.email,
                    city:userDetails.city,
                    state:userDetails.state,
                    mobile:userDetails.mobile,
                    gender:userDetails.gender,
                    dob:userDetails.dob,
                    user:false,
                    owner:true
            }
            gymDetails = await gymData.getGymWithUser(userDetails.email)
            // const reviews = await reviewDataInfo.getAllReviewByUserID(id)
            let name = userProfile.firstName
            if(gymDetails !== null){
                res.render('userProfile', {title: "Profile", userProfile, user:false ,owner:true, gymDetails, loggedin, name,updateSuccess:updateSuccess})
            }
            else{
                res.render('userProfile', {title: "Profile", userProfile, user:false ,owner:true, loggedin, name,updateSuccess:updateSuccess})
            }

        }



        
    }

});

router.post('/updateProfile', async (req,res) => {

    
    let loggedin
     

    if (req.session.user) {
        loggedin = true
    }
    else if(!req.session.user){
        res.redirect('/login')
        loggedin = false
        return
    }
    let id = req.session.user.id
    userDetails = await userData.getUserById(id)
        
    let name = userDetails.firstName
    let role = req.session.user.role
    let firstName = xss(req.body.firstname)
    let lastName = xss(req.body.lastname)
    let email = req.session.user.email
    let city = xss(req.body.city)
    let state = xss(req.body.state)
    let mobile = xss(req.body.mobile)
    let gender = xss(req.body.gender)
    let dob = xss(req.body.dob)
    let password = xss(req.body.password)
    

    userProfile = {
        id:userDetails.id,
        role:userDetails.role,
        firstName:userDetails.firstName,
        lastName:userDetails.lastName,
        email:userDetails.email,
        city:userDetails.city,
        state:userDetails.state,
        mobile:userDetails.mobile,
        gender:userDetails.gender,
        dob:userDetails.dob
    }

    bookDetails = await bookDataInfo.getAllOrderByUserID(req.session.user.id)
        const reviews = await reviewDataInfo.getAllReviewByUserID(id)
        
        for(i of bookDetails){
            i['gymId'] = i['gymId'].toString()
            gymId = i.gymId
            gymDetails = await gymData.getGym(gymId)
            gymName = gymDetails.gymName
            i['gymName'] = gymName
        }

        gymDetails = await gymData.getGymWithUser(userDetails.email)
                

        
    
    let user
    let owner

    if (role == "user"){
        user=true
        owner = false
    }
    else if (role == "owner"){
        user=false
        owner = true
    }
    else
        {
            res.status(400).render('userProfile', {title: "Error", error: "Select valid role",userProfile,loggedin,name,reviews:reviews,bookDetails})
            return
        } 
    

        // if(bookDetails !== null){
        //     res.render('userProfile', {reviews:reviews,title: "Profile", userProfile, user:true ,owner:false, bookDetails, loggedin, name})
            
        // }
        // else{
        //     res.render('userProfile', {reviews:reviews,title: "Profile", userProfile, user:true ,owner:false, loggedin, name})
            
        // }

        // if(gymDetails !== null){
        //     res.render('userProfile', {title: "Profile", userProfile, user:false ,owner:true, gymDetails, loggedin, name})
        // }
        // else{
        //     res.render('userProfile', {title: "Profile", userProfile, user:false ,owner:true, loggedin, name})
        // }


    if( !role || !email || !password || !firstName || !lastName || !gender || !city || !state || !mobile || !dob) {
        res.status(400).render('userProfile', {title: "Error", error: 'You must provide all details',userProfile,loggedin,name,reviews:reviews,bookDetails,owner,user})
        return
    } 

    // if(typeof id !== 'string') throw 'Id should be string'
    // if(!mongodb.ObjectId.isValid(id)) throw 'Not a valid ObjectID'
        
    
    if (typeof role != 'string' || typeof email != 'string' ||  typeof password != 'string' || typeof firstName != 'string' || typeof lastName != 'string' ||
    typeof city != 'string' || typeof state != 'string' || typeof gender != 'string' || typeof mobile != 'string' || 
    typeof dob != 'string') {
        res.status(400).render('userProfile', {title: "Error", error: 'Input should be string',userProfile,loggedin,name,reviews:reviews,bookDetails,owner,user})
        return
    } 

    if (!email.replace(/\s/g, '').length  || !role.replace(/\s/g, '').length  || !password.replace(/\s/g, '').length 
    || !firstName.replace(/\s/g, '').length || !lastName.replace(/\s/g, '').length
    || !city.replace(/\s/g, '').length
    || !state.replace(/\s/g, '').length || !mobile.replace(/\s/g, '').length
    || !gender.replace(/\s/g, '').length || !dob.replace(/\s/g, '').length) {
        res.status(400).render('userProfile', {title: "Error", error: 'Input cannot be empty spaces',userProfile,loggedin,name,reviews:reviews,bookDetails,owner,user})
        return
    } 

    let regMob = mobile.search(/^\d{10}$/);

    if(regMob=== -1){
        res.status(400).render('userProfile', {title: "Error", error:  'PhoneNumber not valid',userProfile,loggedin,name,reviews:reviews,bookDetails,owner,user})
        return 
    } 

    let regEmail = email.search(/^([a-zA-Z0-9_.+-]{1,})(@{1})([a-zA-Z]{1})([a-zA-Z0-9-]{1,})([.]{1})([a-zA-Z]{1,})$/gi);

    if (regEmail === -1) {
        res.status(400).render('userProfile', {title: "Error", error:  'Email format not valid',userProfile,loggedin,name,reviews:reviews,bookDetails,owner,user})
        return
    }
    
    // if (password.length != password.replace(/\s/g, '').length) {
    //     res.status(400).render('signup', {title: "Error", error: 'Password should not contain spaces'})
    //     return
    // }

    
    
    if(password.length <6) 
    {
        res.status(400).render('userProfile', {title: "Error", error: 'Password should atleast 6 character long',userProfile,loggedin,name,reviews:reviews,bookDetails,owner,user})
        return
    }

    if(role != 'user' && role != "owner") 
    {
        res.status(400).render('userProfile', {title: "Error", error: "Select valid role",userProfile,loggedin,name,reviews:reviews,bookDetails,owner,user})
        return
    } 

    if(city != "Jersey City" && city != "Hoboken") 
    {
        res.status(400).render('userProfile', {title: "Error", error: "Select valid city",userProfile,loggedin,name,reviews:reviews,bookDetails,owner,user})
        return
    } 
    
    if(state != "New Jersey" ) 
    {
        res.status(400).render('userProfile', {title: "Error", error: "Select valid state",userProfile,loggedin,name,reviews:reviews,bookDetails,owner,user})
        return
    } 

    if(gender != "male" && gender != "female" && gender != "other") 
    {
        res.status(400).render('userProfile', {title: "Error", error: "Select valid Gender",userProfile,loggedin,name,reviews:reviews,bookDetails,owner,user})
        return
    } 
    
    // let regDob = dob.search(/^(19|20)\d\d[-]([1-9]|1[012])[-]([1-9]|[12][0-9]|3[01])$/)

    // if(regDob == -1) 
    // {
    //     res.status(400).render('signup', {title: "Error", error: 'Date of birth formate not valid'})
    //     return
    // } 
    
     email = email.toLowerCase()

     

    try{
    
    const info = await userData.checkUser(email,password)
    if(info.authenticated == true){
    const updateInfo = await userData.updateUser(id,role,firstName,lastName,city,state,mobile,gender,dob, password)
    if(updateInfo.userUpdated == true){
        req.session.updateSuccess = "Update Successful"
        res.status(200).redirect('/userprofile')
        }
    else {

        //nirav- should i pass user object too ?

        res.status(500).render('userProfile', {title: "Error", error: 'Internal Server Error'})
        }
    }  
    else {
        res.status(500).render('userProfile', {title: "Error", error: 'Internal Server Error'})
        }
    
    }
    catch(e){
        userDetails = await userData.getUserById(id)
        userProfile = {
            id:userDetails.id,
            role:userDetails.role,
            firstName:userDetails.firstName,
            lastName:userDetails.lastName,
            email:userDetails.email,
            city:userDetails.city,
            state:userDetails.state,
            mobile:userDetails.mobile,
            gender:userDetails.gender,
            dob:userDetails.dob
        }
        res.status(400).render('userProfile', {title: "Error", error: e, userProfile,loggedin,name,reviews:reviews,bookDetails,owner,user})
        // res.status(200).redirect('/userprofile')
    }
    
    
});



router.get('/logout', async (req,res) => {
    
    if (!req.session.user) {
        res.redirect('/')
        return
    }
    loggedin = false
    req.session.destroy();
    res.render('logout',{title:'Logged Out'})
    
});


  module.exports = router;