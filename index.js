const express=require('express');
const mongoose=require('mongoose')
const cors=require('cors')
const md5=require('md5')
const jwt=require('jsonwebtoken')
const app=express()
app.use(express.json())

app.use(express.static('build'))
mongoose.connect('mongodb+srv://saidheeraj:saidheeraj@cluster0.ua7re.mongodb.net/shopshome?retryWrites=true&w=majority',{useNewUrlParser: true})

const shopSchema=new mongoose.Schema({
    username: String,
    name:String,
    password: String,
    secret: String,
    items:[
        {
            id:Number,
            name:String,
            date:String,
            time:String,
            price:Number
        }
    ]
})


const User=new mongoose.model('shopitems',shopSchema)

// app.use(cors({
//     origin:'*'
// }))


app.post('/verify',(req,res)=>{
    jwt.verify(req.body.token,"hppavilionx360",function(err,data){
        if(data){
            res.json({userData:data})    
        }
        else{
            res.json({message:'unauth'})
        }
    })
})

app.post('/allitems',(req,res)=>{
    User.findOne({username:req.body.username},function(err,data){
        if(data){
            res.json({data:data.items})
        }
        else{

        }
    })
})

app.post('/signup',(req,res)=>{
  User.findOne({username:req.body.username},async function(err,data){
    if(data){
        res.json({message:'user already found'})
    }
    else{
        const newUser={
            username:req.body.username,
            name:req.body.name
        }

        const userToDB=new User({
            username:req.body.username,
            name:req.body.name,
            password: md5(req.body.password)
        })

        userToDB.save(()=>{
            const token=jwt.sign(newUser,'hppavilionx360',{ expiresIn: '1d'})
            res.json({authToken:token})
        })

    }
  })
})

app.post('/login',(req,res)=>{
    User.findOne({username:req.body.username},function(err,data){
        if(data){
            if( md5(req.body.password) == data.password){
                const newUser={
                    username:req.body.username,
                    name:data.name
                }
                const token=jwt.sign(newUser,'hppavilionx360',{ expiresIn: '1d'})
                res.json({authToken:token}) 
            }
            else{
                res.json({message:'incorrect password'})
            }
        }else{
            res.json({message:'no user found'})
        }
    })
})


app.post('/pushitem',(req,res)=>{

    const name=req.body.name
    const date=req.body.date
    const time=req.body.time
    const price=req.body.price
    const id=req.body.id

    User
    .findOne({ username: req.body.username })
    .then(data => {
        if (!data) throw { message: "Error" }
        data.items.unshift({
            id,
            name,
            date,
            time,
            price
        })

        return data.save()
    })
    .then(data => {
        res.json({message:'done'})
    })
    .catch(err => {
        console.log(err)
    })

})

app.get('*',function(req,res){
    res.sendFile(__dirname+'/build/index.html')
})

app.listen(process.env.PORT || 3001,function(){
    console.log('port is running...')
})
