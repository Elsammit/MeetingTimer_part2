const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const sqlite = require('sqlite3').verbose();                                          
const db = new sqlite.Database('db/database.sqlite3');

app.use(express.static('./js'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*
社員の月給管理DBから読み出し関数.
引数：なし
return Mem_array：｛役職：月給}
*/
function Read_Memsalary(){
    return new Promise(resolve =>{
        const GetMemSalary = "select * from salary;"
        var Mem_array = []
         db.all(GetMemSalary, function (err, rows) {
             rows.forEach(function(row){
                Mem_array.push({name:row.name,salary:row.salary});
             });
             resolve(Mem_array);
         });
    });
}

/*
社員の月給管理DBへの月給セット(セットすべき役職・月給のチェック).
引数：input_salary：各役職の月給.
return：なし.
*/
function Set_Memsalary(intput_salary){
    p = Read_Memsalary();
    var i =0;
    p.then(function(Mem_array){
        Mem_array.forEach(function(array){
            if(array.salary != intput_salary[i]){
                SubSet_Memsalary(array.name,intput_salary[i]);
            }
            i++;
        });
    });
}

/*
社員の月給管理DBへの月給セット(DBへのセット).
引数:   input_name：役職名.
        input_salary：月給.
return：なし.
*/
function SubSet_Memsalary(input_name,input_salary){
    const Set_Memsalary = "update salary set salary ="+ input_salary +  " where name = '" + input_name +"';";
    db.get(Set_Memsalary,function(err,res){
        console.log("set OK");
    });
}

/*
ミーティング時に発生する給料や参加人数をDB登録.
引数：SumSalary：ミーティングにて発生する給料.
      Manager_mem：部長参加人数.
      gl_mem：課長参加人数.
      cheif_mem：係長参加人数.
      employ_mem：社員参加人数.
      Meeting_time：会議時間.
return：なし.
*/
function Set_MeetingList(SumSalary,Manager_mem,gl_mem,cheif_mem,employ_mem,Meeting_time,Meeting_Name){
    const Set_MeetingMoney = "insert into MeetingList values(current_timestamp,'" + Meeting_Name + "'," +
                              SumSalary + "," + Manager_mem + "," + gl_mem + "," + cheif_mem + "," + employ_mem + ",'" + Meeting_time.toString() + "');"
    db.get(Set_MeetingMoney, function (err, rows) {
        console.log("Set OK");
    });
}

/*
無駄な会議を没滅しよう!! 画面表示.
*/
app.get('/',(req,res)=> {
    p = Read_Memsalary();       // 社員の月給管理DBから役職と役職ごとの月給取得.
    p.then(function(Mem_array){ // 取得した結果はMem_arrayに保存.
        html_list = {Manager_name:Mem_array[0].name,Manager_salary:Mem_array[0].salary
            ,GL_name:Mem_array[1].name,GL_salary:Mem_array[1].salary
            ,Chief_name:Mem_array[2].name,Chief_salary:Mem_array[2].salary
            ,Employee_name:Mem_array[3].name,Employee_salary:Mem_array[3].salary
        };  // フロントエンドに通知するためのlist作成.
        res.render(__dirname + "/html/MainPage.ejs",html_list); // フロントエンドで表示するページ指定・通知.
    });
});

/*
フロントエンドからの会議時間における金額のrequest受信.
*/
app.post('/SendMoney',(req,res)=>{  // フロントエンドからの受信.
    Set_MeetingList(req.body.money,req.body.Manager_num,req.body.GL_num,req.body.Chief_num,req.body.Employee_num,req.body.Meeting_time,req.body.Meeting_Name);
    var Memsalary = [req.body.Manager_salary,req.body.GL_salary,req.body.Chief_salary,req.body.Employee_salary];    // 役職毎の月給配列(部長、課長、係長、社員の順).
    Set_Memsalary(Memsalary);  // 役職毎の月給をDBへ保存するための関数コール.

    res.end()
});

app.listen(3000,()=> 
    console.log('Listening on port 3000')
);