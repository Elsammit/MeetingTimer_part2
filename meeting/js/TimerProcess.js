sw_status = 0;
reset_form();

/*
リセットボタン押下時の実行.
*/
function reset_form(){
    if(sw_status == 1){	// タイマスタート中の場合.
        start_count();	// タイマ停止のための処理実行.
    }
    timer = 0;			// タイマ初期化.
    money = 0;			// 金額の初期化.
    result_Message();
    document.form_sw.counter.value=count_format(0); // タイマのクリア.
    document.form_sw.Meeting_Money.value=0;         // 発生金額のクリア.
}

/*
会議出席者全員に対する1秒毎に発生する金額.
*/
function calc_money(){
    var M_salary = calc_sec_salary(document.form_salary.Manager_salary.value) * document.form_salary.Manager_Num.value;     // 部長分 発生金額
    var G_salary = calc_sec_salary(document.form_salary.GL_salary.value) * document.form_salary.GL_Num.value;               // 課長分 発生金額
    var C_salary = calc_sec_salary(document.form_salary.Chief_salary.value) * document.form_salary.Chief_Num.value;         // 係長分 発生金額
    var E_salary = calc_sec_salary(document.form_salary.Employee_salary.value) * document.form_salary.Employee_Num.value;   // 社員分 発生金額
    var Sum_salary = M_salary + G_salary + C_salary + E_salary;

    return Sum_salary;
}

/*
時給を秒毎に発生する給料に変換.
*/
function calc_sec_salary(salary){
	var work_hour = 8;								// 1日の労働時間(8時間で設定).
	var workday_ofmonth = 20;						// 月の労働日数(20日で設定).
    var buf = (10000/work_hour)/workday_ofmonth;	// 月給を秒毎の給料に変換するための計算(1)
    var tsalary = (salary/60)/60 * buf;				// 月給を秒毎の給料に変換するための計算(2)
    return tsalary;
}

/*
会議にて発生した費用を表示するためのメッセージ.
*/
function result_Message(){
    if(sw_status == 0){
        document.getElementById("Before_resultID").innerText = "" 
        document.getElementById("resultID").innerText = "";
        document.getElementById("After_resultID").innerText = "";
    }else{
        document.getElementById("Before_resultID").innerText = "発生費用は" 
        document.getElementById("resultID").innerText = document.form_sw.Meeting_Money.value;
        document.getElementById("After_resultID").innerText = "円!!";
    }
}

function sendToServer(){
    var send_money = document.form_sw.Meeting_Money.value;
    return $.ajax({
        url:"http://192.168.56.2:3000/SendMoney",//phpファイルのURL
        type: "post",
        data: {"money":send_money,
                "Manager_num":document.form_salary.Manager_Num.value,
                "GL_num":document.form_salary.GL_Num.value,
                "Chief_num":document.form_salary.Chief_Num.value,
                "Employee_num":document.form_salary.Employee_Num.value,
                "Manager_salary":document.form_salary.Manager_salary.value,
                "GL_salary":document.form_salary.GL_salary.value,
                "Chief_salary":document.form_salary.Chief_salary.value,
                "Employee_salary":document.form_salary.Employee_salary.value,
                "Meeting_time":document.form_sw.counter.value,
                "Meeting_Name":document.form_sw.Meeting_Name.value
            },	
        dataType: 'text',
        success: function(){	// 転送成功時.
            console.log("success");	
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {	// 転送失敗時.
            console.log("error");
        }
    })
}

/*
スタート(ストップ)ボタン押下時の処理.
*/
function start_count(){
    if(sw_status == 0){										// タイマー未スタートの時にボタン押下した時.
        result_Message();									// メッセージの初期化.
        money = calc_money();								// 入力された月給や人数から1秒毎に発生する会議費用を算出.
        document.form_sw.start.value = "ストップ";			
        sw_status = 1;										// ステータスをタイマースタート中に変更.
        timerID = setInterval("count_up()",1000);			// 1秒毎にcount_up()関数実行.
    }else{													// タイマースタート中の時にボタン押下した時.
        result_Message();
        sendToServer();
        document.form_sw.start.value = "スタート";
        sw_status = 0;										// ステータスをタイマー未スタートに変更.
        clearInterval(timerID);								// 定期的に実行していたcount_up()の実行を停止.
    }
}

/*
1秒カウントアップした際の処理.
*/
function count_up(){
    timer++;														
    document.form_sw.counter.value = count_format(timer);				// カウントアップした結果をテキストに表示.
    document.form_sw.Meeting_Money.value = Math.floor(money * timer);	// moneyを乗算し金額を算出.
}

/*
タイマー表示のフォーマットを時分秒に変換するための処理.
*/
function count_format(num){
    var ts = num % 60;				// 秒変換.
    var tm = Math.floor(num /60);	
    var th = Math.floor(tm/60);		// 時変換.
    tm = tm % 60;					// 分変換.
    return check_digit(th) + ":" + check_digit(tm) + ":" + check_digit(ts);	// フォーマット変換後、00:00:00のフォーマットで出力.
}

/*
数値が1桁であれば先頭に0(例：01)と表示させるための処理.
*/
function check_digit(num){
    var ret = num;
    if(num < 10){
        ret = "0" + num;
    }
    return ret;
}
function show_result(){
    document.location.href = "http://192.168.56.2:3000/result";
}