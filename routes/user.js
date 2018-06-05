var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var session = require('express-session');
var async = require('async');
// MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 5,
	host: 'malid.cgvtbxiixr2x.ap-northeast-2.rds.amazonaws.com',
	user: 'MALID',
	database: 'SE',
	password: '1234qwer'
});

/* GET users listing. */
router.get('/', function(req, res, next) {
	var sql="Select user.*, shipaddress.* from user, shipaddress where user.email=? and shipaddress.email=?";

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  connection.query(sql, [req.session.email, req.session.email], function (err, rows) {
	  	if(err) console.error(err);

	  	console.log("rows : " + JSON.stringify(rows));

	  	res.render('user', {username:req.session.username, title: '회원정보 조회', rows: rows, admin:req.session.admin, sale:req.session.sale});
	  	connection.release();
	  });
	});
});

router.get('/modify', function(req, res, next) {
	var sql="Select * from user where email=?"

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  connection.query(sql, [req.session.email], function (err, rows) {
	  	if(err) console.error(err);

	  	console.log("rows : " + JSON.stringify(rows));

	  	res.render('modify', {username:req.session.username, title: '회원정보 수정', rows: rows, admin:req.session.admin, sale:req.session.sale});
	  	connection.release();
	  });
	});
});

router.post('/modify/1', function(req, res, next) {
	var sql="update user set passwd=?, address=?, phone=? where email=?";
	var passwd=req.body.password;
	var passwd2=req.body.password2;
	var address=req.body.address;
	var phone=req.body.phone;
	var data=[passwd, address, phone, req.session.email];

	//console.log(req.body);
	if(passwd==''){
		sql="update user set address=?, phone=? where email=?";
		data=[address, phone, req.session.email];
	}
	if(passwd!=passwd2){
		res.send("<script>alert('비밀번호가 일치하지 않습니다.');history.back();</script>");
		res.redirect('/user/modify');
	}
	else{
		pool.getConnection(function (err, connection) {
			if (err) throw err;
			connection.query(sql, data, function (err, rows) {
				if(err) console.error(err);
				connection.release();
			});
		});
	}
	res.redirect('/user');
});

router.post('/modify/2', function(req, res, next) {
	var sql="update user set address=? where email=?";
	var address=req.body.address1+" "+req.body.address2;
	var addressSel=req.body.addressSel;
	var data=[address, req.session.email];

	if(addressSel=="기본주소"){
		pool.getConnection(function (err, connection) {
			if (err) throw err;
			connection.query(sql, data, function (err, rows) {
				if(err) console.error(err);
				connection.release();
				sql="update shipaddress set address1=? where email=?";
			});
		});
	}
	else if(addressSel=="추가배송지1")
		sql="update shipaddress set address2=? where email=?";
	else if(addressSel=="추가배송지2")
		sql="update shipaddress set address3=? where email=?";
	pool.getConnection(function (err, connection) {
		if (err) throw err;
		connection.query(sql, data, function (err, rows) {
			if(err) console.error(err);
			connection.release();
		});
	});
	res.redirect('/user');
});

router.post('/modify/3', function(req, res, next) {
	var sql="update user set address=? where email=?";
	var addressSel=req.body.addressSel;
	var data=[null, req.session.email];

	if(addressSel=="기본주소"){
		pool.getConnection(function (err, connection) {
			if (err) throw err;
			connection.query(sql, data, function (err, rows) {
				if(err) console.error(err);
				connection.release();
			});
			sql="update shipaddress set address1=? where email=?";
		});
	}
	else if(addressSel=="추가배송지1")
		sql="update shipaddress set address2=? where email=?";
	else if(addressSel=="추가배송지2")
		sql="update shipaddress set address3=? where email=?";
	pool.getConnection(function (err, connection) {
		if (err) throw err;
		connection.query(sql, data, function (err, rows) {
			if(err) console.error(err);
			connection.release();
		});
	});
	res.redirect('/user');
});

router.get('/saleauthreq', function(req, res, next) {
	var sql="Select * from SaleAuthReq where email=?"

	pool.getConnection(function (err, connection) {
		if (err) throw err;

		connection.query(sql, [req.session.email], function (err, rows) {
			if(err) console.error(err);
			if(rows[0]==undefined){
				sql="Select * from user where email=?";
				connection.query(sql, [req.session.email], function (err, rows) {
					if(err) console.error(err);
					res.render('saleauthreq', {username:req.session.username, rows: rows, admin:req.session.admin, sale:req.session.sale});
				});
			}
			else{
				res.send("<script>alert('이미 판매자등록이 요청이 된 상태입니다.');history.back();</script>");
			}
			connection.release();		
		});
	});
});

router.post('/saleauthreq', function(req, res, next) {
	var sql="insert into SaleAuthReq(email, company, address, category, manager, phone1, phone2, content) Values(?,?,?,?,?,?,?,?)";
	var email=req.session.email;
	var company=req.body.company;
	var address=req.body.address1+" "+req.body.address2;
	var category=req.body.category;
	var manager=req.body.manager;
	var phone1=req.body.phone1;
	var phone2=req.body.phone2;
	var content=req.body.contents;
	var data=[email, company, address, category, manager, phone1, phone2, content];

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  connection.query(sql, data, function (err, rows) {
	  	if(err) console.error(err);

	  	console.log("rows : " + JSON.stringify(rows));

	  	connection.release();
	  });
	});
	res.redirect('/user');
});

router.get('/saleauthdel', function(req, res, next) {
	var sql="Select * from SaleAuthReq where email=?"

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  connection.query(sql, [req.session.email], function (err, rows) {
	  	if(err) console.error(err);

	  	res.render('saleauthdel', {username:req.session.username, title: '판매자등록삭제', rows: rows, admin:req.session.admin, sale:req.session.sale});
	  	connection.release();
	  	
	  });
	});
});

router.post('/saleauthdel', function(req, res, next) {
	var sql="update user set sale=? where email=?";

	pool.getConnection(function (err, connection) {
		if (err) throw err;

		connection.query(sql,[0, req.session.email], function (err, rows) {
			if(err) console.error(err);
			sql="delete from SaleAuthReq where email=?"
			connection.query(sql,[req.session.email], function (err, rows) {
				if(err) console.error(err);

				connection.release();
			});			
		});
	});
	delete req.session.sale;
	req.session.sale=0;
	res.redirect('/user');
});

router.get('/orderinquiry', function(req, res, next) {
	var sql = "SELECT product.code, order_.purchaser, product.name as name, order_.price, order_.amount, order_.address, date_format(order_.date, '%y-%m-%d') as date FROM product, order_ where order_.email=? and product.code=order_.product_code";
	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  connection.query(sql, [req.session.email], function (err, rows) {
	  	if(err) console.error(err);
	  	console.log(rows);
	  	res.render('orderinquiry', {username:req.session.username, title: '판매자등록삭제', rows: rows, admin:req.session.admin, sale:req.session.sale});
	  	connection.release();
	  	
	  });
	});
});

router.get('/withdrawreq', function(req, res, next) {
	var sql="Select * from WithdrawReq where email=?";

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  connection.query(sql, [req.session.email], function (err, rows) {
	  	if(err) console.error(err);
	  	console.log(rows);
	  	if(rows[0]==undefined){
	  		sql="Select * from user where email=?";
	  		connection.query(sql, [req.session.email], function (err, rows) {
	  			if(err) console.error(err);
	  			res.render('withdrawreq', {username:req.session.username, title: '회원탈퇴', rows: rows, admin:req.session.admin, sale:req.session.sale});
	  		});
	  	}
	  	else{
	  		res.send("<script>alert('이미 회원탈퇴 요청이 된 상태입니다.');history.back();</script>");
	  	}
	  	connection.release();
	  });
	});
});

router.post('/withdrawreq', function(req, res, next) {
	var sql="insert into WithdrawReq(email, content) values(?, ?)";

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  connection.query(sql, [req.session.email, req.body.contents], function (err, rows) {
	  	if(err) console.error(err);

	  	connection.release();
	  	res.redirect('/user');
	  });
	});
});

router.get('/sellerOrder', function(req, res, next) {
	if(!req.session.username || !req.session.sale)
		res.redirect('/');

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection

		var sql = "select order_.purchaser, order_.price, order_.amount, order_.address, order_.phone, date_format(order_.date, '%y-%m-%d %r') as date, product.code, product.name, product.stock, product.sales from order_ " +
    "INNER JOIN product on product.code=order_.product_code where product_code " +
    "in (select code from product where seller=(select email from user where username=?));";
	  connection.query(sql, [req.session.username], function (err, rows) {
	  	if(err) console.error(err);
	  	console.log(rows);
	  	res.render('sellerOrder', {username:req.session.username, title: '구매요청', rows: rows, admin:req.session.admin, sale:req.session.sale});
	  	connection.release();
	  });
	});
});

router.get('/productList', function(req, res, next) {
	if(!req.session.username || !req.session.sale)
		res.redirect('/');

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection

		var sql = "SELECT * FROM product WHERE seller=?"
	  connection.query(sql, [req.session.email], function (err, rows) {
	  	if(err) console.error(err);
	  	console.log(rows);
	  	res.render('productList', {username:req.session.username, title: '물품관리', rows: rows, admin:req.session.admin, sale:req.session.sale});
	  	connection.release();
	  });
	});
});
module.exports = router;
