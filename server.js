const http = require("http");
const Post = require('./models/post.js')
const {headers} = require('./httpmethods.js')
require('dotenv').config()
// console.log(process.env.PORT);

const dataBaseUrl = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

const mongoose = require('mongoose');
mongoose.connect(dataBaseUrl)
    .then(res=>{
        console.log("資料庫連接成功")
    })
    .catch(err=>{
        console.log(err);
    })

const listenRequest = async(req,res)=>{
    let body="";
    req.on('data', (chunk)=>{
        body += chunk
    })
    if(req.url==='/posts' && req.method === 'GET'){
        const posts = await Post.find();
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            'status':'success',
            posts
        }))
        res.end();
    }else if(req.url==='/posts' && req.method === 'POST'){
        req.on('end', async()=>{
            try{
                const data = JSON.parse(body)
                console.log(data);
                const newPosts = await Post.create({
                        name: data.name,
                        tags: data.tags,
                        type: data.type,
                        image:data.image,
                        content: data.content,
                        likes: data.likes,
                        comments: data.comments
                    });
                res.writeHead(200, headers);
                res.write(JSON.stringify({
                    "status":"true",
                    posts:newPosts
                }))
                res.end()
            }catch(error){
                res.writeHead(400, headers);
                res.write(JSON.stringify({
                    "status":"false",
                    'message':"請確認欄位資訊或者ID為是否存在"
                }));
                res.end();
            }
        })
    }else if(req.url.startsWith('/posts/') && req.method === 'PATCH'){
        req.on('end', async()=>{
            try{
                const data = JSON.parse(body);
                const id = req.url.split("/").pop();
                const posts = await Post.findByIdAndUpdate({
                    "_id":id
                },{
                    "name": data.name,
                    "price": data.price,
                    "rating": data.rating
                });
                res.writeHead(200, headers);
                res.write(JSON.stringify({
                    "success":"true",
                    posts
                }))
                res.end();
            }catch(error){
                res.writeHead(400, headers);
                res.write(JSON.stringify({
                    "status":"false",
                    'message':"請確認欄位資訊或者ID為是否存在"
                }));
                res.end();
            }
        })
    }else if(req.url === '/posts' && req.method === 'DELETE'){
        const posts = await Post.deleteMany({});
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status":"true",
            posts
        }))
        res.end();
    }else if(req.url.startsWith('/posts/') && req.method === 'DELETE'){
        try{
            const id = req.url.split('/').pop()
            const posts = await Post.findByIdAndDelete({
                "_id":id
            })
            res.writeHead(200, headers);
            res.write(JSON.stringify({
                "success":"true",
                posts
            }))
            res.end();
        }catch(error){
            res.writeHead(400, headers);
            res.write(JSON.stringify({
                "status":"false",
                'message':"請確認欄位資訊或者ID為是否存在"
            }));
            res.end();
        }
    }else if(req.url==='/posts' && req.method === 'OPTIONS'){
        res.writeHead(200, headers);
        res.end();
    }else{
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "success":"false",
            "message":"請確認網址"
        }))
        res.end();
    }
}
const server = http.createServer(listenRequest)
server.listen(process.env.PORT || 3005)