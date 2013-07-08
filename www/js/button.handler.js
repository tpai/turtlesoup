//儲存湯資訊
$("#save").click(function() {
	$(this).prop("disabled", "disabled")

	var id = (soup_id === undefined)?-1:soup_id
	var title = $("#title input").prop("value")
	var online = $("input[name='trigger']:checked").val()
	var progress = $("#progress input").prop("value")
	var prev = $("#previous textarea").val()
	var h_inf = $("#host_inf textarea").val()
	var g_inf = $("#guest_inf textarea").val()
	var ans = $("#answer textarea").val()

	if(title == "" || prev == "") {
		alert("標題跟前情提要是必填的喔 :)")
	}

	else {
		var data = {
			id: id,
			title: title,
			online: online,
			progress: progress,
			previous: prev,
			host_inf: h_inf,
			guest_inf: g_inf,
			answer: ans
		}
		// console.log(data)
		console.log("Save soup data.")

		FB.api("/me", function (res) {
			data["hostman"] = res.name
			socket.emit("sav_soup_data", { soup: data })
			//創湯後決定是否分享至FB後返回首頁
			if(id == -1) {
				FB.ui(
					{
						method: "feed",
						name: title,
						link: location.href,
						//picture: "http://fbrell.com/f8.jpg",
						caption: "大家來喝海龜湯",
						description: prev
					},
					function(response) {
						location.href = "/"
					}
				);
			}
			//不允許連點
			else {
				$("#save").prop("disabled", "")
			}
		})
	}
})

//開關資訊面板
$("#show_inf_table").click(function() {
	$(".inf_table").toggle()
})

//添加對話內容至表格
var add_to_commu_table = function() {
	var says = $("#says").prop("value")
	if(says != "") {

		//新增留言歷史
		var arr = JSON.parse(localStorage["says_history"])
		arr.unshift(says)
		localStorage["says_history"] = JSON.stringify(arr)

		//取得使用者名稱
		FB.api("/me", function (res) {

			var user = res.name

			//過濾不法字元 同時進行parse
			says = content_parser(strip_tags(says, ""))

			if(says == ":help") {
				says = "<br /><br /><b>&gt;&gt; 功能說明 &lt;&lt;</b>\n<br /><br />"+
				"* 發布新湯可選擇分享到塗鴉牆 ( 找朋友一起來玩 XD )\n<br />"+
				"* PC版新增留言時間 ( 手機版隱藏 避免畫面擁擠 )\n<br />"+
				"* 新增圖片及連結產生功能 ( 輸入圖片位址或網址 )\n<br />"+
				"* 新增留言歷史功能 ( 在留言框中按方向鍵上下可重現之前留言 )\n<br />"+
				"* 新增標記姓名功能 ( 輸入 [姓名] 或點擊淡藍色底的名字 )\n<br />"+
				"* 新增標亮特定行功能 ( 輸入 :14 第十四行會以粉紅色底標亮 )\n<br /><br />"
			}
			else {
				socket.emit("user_chat", {
					id: soup_id,
					user: user,
					says: says,
					time: new Date().toLocaleString()
				})
			}

			//添加留言內容至表格
			$("#commu").prepend("<tr><td>"+user+"："+says+"</td></tr>")
			//清空留言
			$("#says").prop("value", "")

		})

		// console.log("["+soup_id+"] "+user+" says '"+says+"'.")
	}
};

//送出對話
var history_index = -1
$("#send").click(add_to_commu_table)
$("#says").keyup(function(e) {
	if(e.which == 13) {
		history_index = -1
		add_to_commu_table()
		$("#highlight").hide()
	}
	else if(e.which == 38 || e.which == 40) {

		var arr = JSON.parse(localStorage["says_history"])

		switch(e.which) {
			case 38:
				//尚在對話歷史範圍內
				if(history_index < arr.length - 1)history_index++
				break
			case 40:
				//尚在對話歷史範圍內
				if(history_index > 0)history_index--
				break
		}

		//將歷史紀錄帶到輸入框
		$("#says").prop("value", arr[history_index])
	}
	
})