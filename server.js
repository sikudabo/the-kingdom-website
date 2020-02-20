const express = require('express');
const app = express();
const https = require('https');
const http = require('http');
const path = require('path');
const _ = require('underscore');
const querystring = require('querystring');
const ejs = require('ejs');
const fs = require('fs');
const bodyParser = require('body-parser');
const logging = require('morgan');
const errorHandler = require('errorhandler');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "path");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.fieldname + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "addr",
        pass: "pass"
    }
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', port);

app.use(express.static(path.join(__dirname, 'public')));
app.use(logging('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'randomsecret', resave: true, rolling: true, cookie: { maxAge: 36000000 }}));
app.use(cookieParser());

const options = {
    key: fs.readFileSync('cert.pem'),
    cert: fs.readFileSync('key.pem'),
};

var users = fs.readFileSync('users.json');
users = JSON.parse(users);

app.get('/', (req, res, next) => {
    res.render('index');
});

app.get('/events', (req, res, next) => {
    res.render("events");
});

app.get('/contact', (req, res, next) => {
    res.render('contact');
});

app.get('/our-story', (req, res, next) => {
    res.render('our-story');
});

app.get('/work-here', (req, res, next) => {
    res.render('work-here');
});

app.get('/plan-party', (req, res, next) => {
    return res.render('plan-party');
});

app.post('/party-data', (req, res, next) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let phone = req.body.phone;
    let description = req.body.description;
    let mailOptions = {
        from: 'sender@gmail.com',
        to: 'target@gmail.com',
        subject: 'The Kingdom Party Request!',
        text: `First Name: ${firstName} \nLast Name: ${lastName} \nEmail: ${email} \nPhone ${phone} \nDescription: ${description}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            console.log(err.message);
            res.status(500).send('Error Processing Your Request. Try Again');
        }
        else {
            console.log(info.response);
            res.redirect('/');
        }
    });
});

app.get('/gallery', (req, res, next) => {
    res.render('gallery');
});

app.get('/events', (req, res, next) => {
    res.render('events');
});

app.get('/menu', (req, res, next) => {
    res.render('menu');
});

app.get('/sign-in', (req, res, next) => {
    res.render('sign-in');
});

app.get('/sign-up', (req, res, next) => {
    res.render('sign-up');
});

app.get('/private-profile-page', (req, res, next) => {
    if(req.session.username) {
        var user = users.find(obj => obj.username === req.session.username);
        console.log(user.avatar);
        if(user) {
            res.render('private-profile-page', {user: user});
        }
        else {
            res.redirect('/sign-in');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/handle-video-post', upload.single('videoPostVideo'), (req, res, next) => {
    if(req.session.username) {
        var now = Date.now();
        var postVideoPath = path.join('video-posts', now.toString() + '.mp4');
        var inVideoPath = fs.createReadStream(path.join(req.file.destination, req.file.filename));
        var outVideoPath = fs.createWriteStream(path.join(__dirname, 'public', 'video-posts', now.toString() + '.mp4'));
        inVideoPath.pipe(outVideoPath);
        var username = req.session.username;
        var curUser = users.find(user => user.username === username);
        var date = new Date();
        var month = date.getMonth() + 1;
        var date = date.getDate();
        var year = "2020";
        var dateString = `${month}-${date}-${year}`; 
        if(curUser) {
            curUser.posts.unshift({
                source: postVideoPath,
                id: Date.now(),
                caption: req.body.videoPostCaption,
                date: dateString,
                postType: 'video',
                comments: [],
                likes: []
            });
            fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
            users = fs.readFileSync(path.join(__dirname, 'users.json'));
            users = JSON.parse(users);
            res.redirect('/private-profile-page');
        }
        else {
            res.status(500).send();
        }
    }
    else {
        res.redirect('/login');
    }
});

app.post('/handle-photo-post', upload.single('postPhoto'), (req, res, next) => {
    if(req.session.username) {
        var postPhotoPath = path.join('photo-posts', req.file.filename);
        var inPhotoPath = fs.createReadStream(path.join(req.file.destination, req.file.filename));
        var outPhotoPath = fs.createWriteStream(path.join(__dirname, 'public', 'photo-posts', req.file.filename));
        inPhotoPath.pipe(outPhotoPath);
        var username = req.session.username;
        var curUser = users.find(user => user.username === username);
        var date = new Date();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var year = date.getFullYear();
        var dateString = `${month}-${day}-${year}`;
        if(curUser) {
            curUser.posts.unshift({
                photo: postPhotoPath,
                id: Date.now(),
                caption: req.body.photoCaption,
                likes: [],
                comments: [],
                postType: "photo",
                date: dateString
            });
            fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
            users = fs.readFileSync(path.join(__dirname, 'users.json'));
            users = JSON.parse(users);
            res.redirect('/private-profile-page');
        }
        else{
            res.status(500).send();
        }

    }
    else {
        res.redirect('/login');
    }

});

app.post('/add-new-user', upload.single('newUserAvatar'), (req, res, next) => {
    
    try {
        var avatarPath = path.join(req.file.destination, req.file.filename);
        var inAvatar = fs.createReadStream(path.join(req.file.destination, req.file.filename));
        var outAvatar = fs.createWriteStream(path.join(__dirname, 'public', 'avatars', req.file.filename));
        avatarPath = path.join('avatars', req.file.filename);
        inAvatar.pipe(outAvatar);
        var username = req.body.username;
        if(users.find(user => user.username === username)) {
            res.send("Username Taken");
            res.end();
            return;
        }
        var password = req.body.password;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var birthday = req.body.birthday;
        var gender = req.body.gender;
        var email = req.body.email;
        var city = req.body.city;
        var state = req.body.state;
        var zip = req.body.zip;
        var phone = req.body.phone;
        var bio = req.body.bio;
        users.push({
            username: username,
            password: password,
            firstName: firstName,
            lastName: lastName,
            birthday: birthday,
            gender: gender,
            email: email,
            city: city,
            state: state,
            zip: zip,
            phone: phone,
            bio: bio,
            avatar: avatarPath,
            posts: [],
            photos: [],
            videos: []
        });
        fs.writeFileSync('users.json', JSON.stringify(users), (err) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log('Database Successfully Updated');
            }
        });
        users = fs.readFileSync('users.json');
        users = JSON.parse(users);
        req.session.auth = true;
        req.session.username = username;
        res.send('success');
    }
    catch (e) {
        console.log(e);
        res.send('error');
    }
});

app.post('/unique-username', (req, res, next) => {
    var checkUsername = req.body.username;
    var user = users.find(obj => obj.username === checkUsername);
    if (user) {
        res.send('invalid');
    }
    else {
        res.send('success');
    }
});

app.post('/verify-login', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    var curUser = users.find(user => user.username === username);
    if(curUser) {
        if(curUser.password === password) {
            req.session.auth = true;
            req.session.username = username;
            res.send('success');
        }
        else {
            res.send('Invalid Password!');
        }
    }
    else {
        res.send('Invalid Username!');
    }
});

app.post('/handle-text-post', (req, res, next) => {
    if(req.session.username) {
        var username = req.session.username;
        var post = req.body.text;
        var date = req.body.date;
        var curUser = users.find(user => user.username === username);
        if(curUser) {
            curUser.posts.unshift({
                content: post,
                date: date,
                id: Date.now(),
                likes: [],
                comments: [],
                postType: "text"
            });
            fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
            users = fs.readFileSync(path.join(__dirname, 'users.json'));
            users = JSON.parse(users);
            res.send('success');
        }
        else {
            res.send('session expired');
        }
    }
    else {
        res.send('session expired');
    }
});

app.post('/handle-checkout', (req, res, next) => {
    let orders = req.body.orders;
    let totalPrice = req.body.totalPrice;
    let userInfo = req.body.userInfo;
    let orderString = "";
    console.log(JSON.stringify(orders));
    console.log(JSON.stringify(userInfo));
    let mailOptions = {
        from: 'lakingsdodgers@gmail.com',
        to: 'sikudabo@iu.edu',
        subject: 'new user order',
        text: 'The order is: ' + JSON.stringify(orders) + '\nThe total price is:' + totalPrice + '\nInfo ' + JSON.stringify(userInfo)
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            res.send('Error');
        }
        else {
            console.log(info.response);
            res.send('success');
        }
    });
});

app.post('/handle-private-comment', (req, res, next) => {
    let username = req.body.user;
    let postId = req.body.postId;
    let message = req.body.message;
    let user = _.find(users, u => u.username === username);
    let targetPost = _.find(user.posts, post => post.id === postId);
    if(user) {
        if(targetPost) {
            targetPost.comments.push({
                user: username,
                content: message,
                avatar: user.avatar,
                id: Date.now()
            });
            fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
            users = fs.readFileSync(path.join(__dirname, 'users.json'));
            users = JSON.parse(users);
            res.send('success');
        }
        else {
            res.send('Post Not Found');
        }
    }
    else {
        res.send('User Not Found');
    }
});

app.post('/handle-public-comment', (req, res, next) => {
    let targetUsername = req.body.targetUser;
    let senderUsername = req.body.senderUser;
    let message = req.body.message;
    let postId = req.body.postId;
    let targetUser = _.find(users, user => user.username === targetUsername);
    let senderUser = _.find(users, user => user.username === senderUsername);
    let targetPost = _.find(targetUser.posts, post => post.id === postId);
    if(targetUser) {
        if(senderUser) {
            if(targetPost) {
                targetPost.comments.push({
                    user: senderUsername,
                    content: message,
                    avatar: senderUser.avatar,
                    id: Date.now()
                });
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.send('success');
            }
            else {
                res.send('Post Not Found');
            }
        }
        else {
            res.send('User Not Found');
        }
    }
    else {
        res.send('User Not Found');
    }
});

app.post('/handle-delete-post', (req, res, next) => {
    let username = req.body.username;
    let postId = req.body.postId;
    let user = _.find(users, u => u.username === username);
    let post = _.find(user.posts, p => p.id === postId);
    if(user) {
        if(post) {
            user.posts = _.reject(user.posts, post => post.id === postId);
            fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
            users = fs.readFileSync(path.join(__dirname, 'users.json'));
            users = JSON.parse(users);
            res.send('success');
        }
        else {
            res.send('Could Not Find Post!');
        }
    }
    else {
        res.send('Could Not Find User!');
    }
});

app.post('/handle-private-like', (req, res, next) => {
    let username = req.body.username;
    let postId = req.body.postId;
    let user = _.find(users, u => u.username === username);
    let post = _.find(user.posts, p => p.id === postId);
    if(user) {
        if(post) {
            let isLiked = _.find(post.likes, thisPost => thisPost.username === username);
            if(isLiked) {
                post.likes = _.reject(post.likes, pL => pL.username === username);
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.send('unliked');
            }
            else {
                let obj = {
                    username: username
                };
                post.likes.push(obj);
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.send('liked');
            }
        }
        else {
            res.send('Could Not Find Post!');
        }
    }
    else {
        res.send('Could Not Find User!');
    }
});

app.post('/handle-public-like', (req, res, next) => {
    let targetUsername = req.body.targetUser;
    let senderUsername = req.body.senderUser;
    console.log(targetUsername);
    let postId = req.body.postId;
    let targetUser = _.find(users, user => user.username === targetUsername);
    let senderUser = _.find(users, user => user.username === senderUsername);
    let targetPost = _.find(targetUser.posts, post => post.id === postId);
    if(targetUser) {
        if(senderUser) {
            if(targetPost) {
                let isLiked = _.find(targetPost.likes, thisPost => thisPost.username === senderUsername);
                if(isLiked) {
                    targetPost.likes = _.reject(targetPost.likes, thisPost => thisPost.username === senderUsername);
                    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                    users = fs.readFileSync(path.join(__dirname, 'users.json'));
                    users = JSON.parse(users);
                    res.send('unliked');
                }
                else {
                    targetPost.likes.push({
                        username: senderUsername
                    });
                    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                    users = fs.readFileSync(path.join(__dirname, 'users.json'));
                    users = JSON.parse(users);
                    res.send('liked');
                }
            }
            else {
                res.send('Post Not Found');
            }
        }
        else {
            res.send('User Not Found');
        }
    }
    else {
        res.send('User Not Found');
    }
});

app.post('/handle-user-search', (req, res, next) => {
    let searcher = req.body.searcher;
    let searchName = req.body.searchName;
    let searchUser = _.find(users, user => user.username === searchName);
    if(searchUser) {
        res.send(searchName);
    }
    else {
        res.send('could not find user');
    }
});

app.get('/public-profile-page', (req, res, next) => {
    if(req.session.username) {
        let thisUser = _.find(users, user => user.username === req.session.username);
        let targetUser = _.find(users, user => user.username === req.query.userProfile);
        return res.render('public-profile-page', {privateUser: targetUser, thisUser: thisUser});
        next();
    }
    else {
        res.redirect('/sign-in');
    }
});

app.get('/user-settings', (req, res, next) => {
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        res.render('user-settings', {user: user});
    }
    else {
        res.redirect('/sign-in');
    }
});

app.get('/user-settings-update', (req, res, next) => {
    let updateAttribute = req.query.update;
    if(req.session.username && updateAttribute) {
        let user = _.find(users, user => user.username === req.session.username);
        return res.render('user-settings-update', {user: user, updateAttribute: updateAttribute});
        next();
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-first-name', (req, res, next) => {
    let firstName = req.body.firstName;
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        if(user) {
            user.firstName = firstName;
            fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
            users = fs.readFileSync(path.join(__dirname, 'users.json'));
            users = JSON.parse(users);
            res.redirect('/user-settings');
        }
        else {
            res.status(500).send('We were not able to update that!');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-last-name', (req, res, next) => {
    let lastName = req.body.lastName;
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        if(user) {
            try {
                user.lastName = lastName;
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.redirect('/user-settings');
            }
            catch(e) {
                console.log(e.message);
                res.status(500).render('500');
            }
        }
        else {
            res.status(500).send('User Not Found');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-username', (req, res, next) => {
    let username = req.body.username;
    let isTaken = _.find(users, user => user.username === username);
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        if(user) {
            try {
                user.username = username;
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                req.session.username = username;
                res.redirect('/user-settings');
            }
            catch(err) {
                console.log(err.message);
                res.status(500).send('Unable To Update Username');
            }
        }
        else {
            res.status(500).send('Unable To Find User');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-password', (req, res, next) => {
    let password = req.body.password;
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        if(user) {
            try {
                user.password = password;
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.redirect('/user-settings');
            }
            catch(err) {
                console.log(err.message);
                res.status(500).send('Error Updating Password. Try Again Later');
            }
        }
        else {
            res.status(500).send('User Not Found');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-birthday', (req, res, next) => {
    let birthday = req.body.birthday;
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        if(user) {
            try {
                user.birthday = birthday;
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.redirect('/user-settings');
            }
            catch(err) {
                console.log(err.message);
                res.status(500).send('There was an error changing your birthday. Try again later');
            }
        }
        else {
            res.status(500).send('Could not find user');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-gender', (req, res, next) => {
    let gender = req.body.gender;
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username); 
        if(user) {
            try {
                user.gender = gender;
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.redirect('/user-settings');
            }
            catch(err) {
                console.log(err.message);
                res.status(500).send('Error updating gender. Try again later!');
            }
        }
        else {
            res.status(500).send('Could Not Find User!');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-city', (req, res, next) => {
    let city = req.body.city;
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        if(user) {
            try {
                user.city = city;
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.redirect('/user-settings');
            }
            catch(err) {
                console.log(err.message);
                res.status(500).send('There was an error changing your city. Try again later');
            }
        }
        else {
            res.status(500).send('Could not find user');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-state', (req, res, next) => {
    let state = req.body.state;
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        if(user) {
            try {
                user.state = state;
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.redirect('/user-settings');
            }
            catch(err) {
                console.log(err.message);
                res.status(500).send('There was an error changing your state. Try again later');
            }
        }
        else {
            res.status(500).send('Could not find user');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-zip', (req, res, next) => {
    let zip = req.body.zip;
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        if(user) {
            try {
                user.zip = zip;
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.redirect('/user-settings');
            }
            catch(err) {
                console.log(err.message);
                res.status(500).send('There was an error changing your zip. Try again later');
            }
        }
        else {
            res.status(500).send('Could not find user');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-phone', (req, res, next) => {
    let phone = req.body.phone;
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        if(user) {
            try {
                user.phone = phone;
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.redirect('/user-settings');
            }
            catch(err) {
                console.log(err.message);
                res.status(500).send('There was an error changing your phone number. Try again later');
            }
        }
        else {
            res.status(500).send('Could not find user');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-email', (req, res, next) => {
    let email = req.body.email;
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        if(user) {
            try {
                user.email = email;
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.redirect('/user-settings');
            }
            catch(err) {
                console.log(err.message);
                res.status(500).send('There was an error changing your email. Try again later');
            }
        }
        else {
            res.status(500).send('Could not find user');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-bio', (req, res, next) => {
    let bio = req.body.bio;
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        if(user) {
            try {
                user.bio = bio;
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.redirect('/user-settings');
            }
            catch(err) {
                console.log(err.message);
                res.status(500).send('There was an error changing your bio. Try again later');
            }
        }
        else {
            res.status(500).send('Could not find user');
        }
    }
    else {
        res.redirect('/sign-in');
    }
});

app.post('/update-avatar', upload.single('avatar'), (req, res, next) => {
    if(req.session.username) {
        console.log('User Working');
        let user = _.find(users, user => user.username === req.session.username);
        if(user) {
            try {
                let inFile = fs.createReadStream(path.join(req.file.destination, req.file.filename));
                let outFile = fs.createWriteStream(path.join(__dirname, 'public', 'avatars', req.file.filename));
                let avatarPath = path.join('avatars', req.file.filename);
                inFile.pipe(outFile);
                user.avatar = avatarPath;
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));
                users = fs.readFileSync(path.join(__dirname, 'users.json'));
                users = JSON.parse(users);
                res.redirect('/user-settings');
            }
            catch(err) {
                console.log(err.message);
                res.status(500).send('Error Changing Avatar');
            }
        }
        else {
            res.status(500).send('User Not Found');
        }
    }
    else {
        res.redirect('/sign-in');
    }

});

app.get('/chat-room', (req, res, next) => {
    if(req.session.username) {
        let user = _.find(users, user => user.username === req.session.username);
        res.render('chat-room', {user: user});
    }
    else {
        res.redirect('/');
    }
});

app.post('/handle-subscribe-email', (req, res, next) => {
    let address = req.body.email;
    try {
        fs.appendFileSync(path.join(__dirname, 'subscribe-list.txt'), address + '\n', {encoding: 'utf-8'});
        res.send('success');
    }
    catch(e) {
        console.log(e.message);
        res.send('error');
    }
});

app.post('/handle-application', upload.single('resume'), (req, res, next) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.state;
    let address = req.body.address;
    let email = req.body.email;
    let phone = req.body.phone;
    let inFile = req.file.path;
    let mailOptions = {
        from: 'sender@gmail.com',
        to: 'target@gmail.com',
        subject: 'New Application For The Kingdom Venue!',
        text: `First Name: ${firstName} \nLast Name: ${lastName} \nCity: ${city} \nState: ${state} \nZip: ${zip} \nEmail: ${email} \nPhone: ${phone}`,
        attachments: [{
            filename: 'resume.docx',
            content: fs.createReadStream(req.file.path)
        }]
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            console.log(err);
            res.status(500).send('Error Processing Your Application. Try Again!');
        }
        else {
            console.log(info.response);
            res.redirect('/');
        }
    });
});

app.post('/handle-feedback', (req, res, next) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let phone = req.body.phone;
    let feedback = req.body.feedback;
    let mailOptions = {
        from: 'sender@gmail.com',
        to: 'target@gmail.com, anotherTarget@gmail.com',
        subject: 'The Kingdom User Feedback',
        text: `First Name: ${firstName} \nLast Name: ${lastName} \nEmail: ${email} \nPhone: ${phone} \n \nFeedback: ${feedback}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            console.log(err.message);
            res.status(500).send('Error: Could Not Accept Feedback At This Time. Try Again Later!');
        }
        else {
            console.log(info.response);
            res.redirect('/');
        }
    });
});

const server = https.createServer(options, app).listen(app.get('port'), 'IP Address', () => {
    console.log(`Listening on port ${app.get('port')}`);
});

const io = require('socket.io').listen(server);

io.on('connection', client => {
    console.log('A client has connected');

    client.on('disconnect', () => {
        console.log('User disconnected');
    });

    client.on('sentMsg', data => {
        let username = data.username;
        let msg = data.msg;
        let user = _.find(users, user => user.username === username);
        let avatar = user.avatar;
        io.emit('sentMsg', {
            msg: msg,
            username: username,
            avatar: avatar
        });
        console.log(data);
    });
});

app.use((req, res,next) => {
    res.status(404).render('404');
});

app.use((req, res, next) => {
    res.status(500).render('500');
});
