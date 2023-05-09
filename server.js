const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://harinworld95:bC7HiRIwJi3Aueap@cluster0.yl5buva.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  async function run() {
    try {
      await client.connect();
      await client.db("node-todoapp").collection("post");
      console.log('저장완료');
    } finally {
      
    }
  }
  run().catch(console.dir);



app.get('/pet', (요청, 응답)=>{
    응답.send('펫용품 페이지입니다.');
})

app.get('/', (요청, 응답)=>{
    응답.sendFile(__dirname + '/index.html');
})

app.get('/write', (요청, 응답)=>{
    응답.sendFile(__dirname + '/write.html');
})

//html폼에서 /add로 post요청하면
app.post('/add', (요청, 응답)=>{
    응답.send('전송완료');
    //db.counter에서 총게시물갯수를 찾는다.
    client.db("node-todoapp").collection("counter").findOne({ name : '게시물갯수' }, (에러, 결과)=>{
      console.log(결과.totalPost);
      let 총게시물갯수 = 결과.totalPost;
      //db.post에 새발행글을 기록한다.
      client.db("node-todoapp").collection("post").insertOne({ _id : 총게시물갯수 + 1,  제목 : 요청.body.title, 날짜 : 요청.body.date}, (에러, 결과)=>{
        console.log('저장완료');
        //counter에있는 totalPost에 1을 더한다.
        client.db("node-todoapp").collection("counter").updateOne({name:'게시물갯수'},{ $inc : {totalPost:1} }, (에러, 결과)=>{
          if(에러){
            return console.log(에러);
          }
        })
      });
    });
})

app.listen(8080, ()=>{
  console.log('listening on 8080');
});

app.get('/list', (요청, 응답)=>{
  client.db("node-todoapp").collection("post").find().toArray((에러, 결과)=>{
    console.log(결과);
    응답.render('list.ejs', { posts : 결과 });
  });
})

app.delete('/delete', (요청, 응답)=>{
  console.log(요청.body);
  요청.body._id = parseInt(요청.body._id);
  client.db("node-todoapp").collection("post").deleteOne(요청.body, (에러, 결과)=>{
    console.log('삭제완료');
  })
})