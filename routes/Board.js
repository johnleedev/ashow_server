const express = require('express');
const router = express.Router()
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');

// 게시글 전체 목록 조회 API
router.get('/posts', (req, res) => {
  db.query(`
    SELECT p.*, COUNT(c.id) AS commentCount
    FROM posts p
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id
  `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      console.log(result)
      res.send(result);
      res.end();
    } else {              
      res.send(error);
      res.end();
    }            
  });
});

// 게시글 조회시, 조회수 증가시키기
router.post('/posts/:postId', (req, res) => {
  var postId = parseInt(req.params.postId);
  db.query(`
  UPDATE posts SET views = views + 1 WHERE id = ${postId}
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {            
    res.send(true);
    res.end();
  } else {
    res.send(error);
    res.end();
  }})
});

// 게시글 생성하기
router.post('/posts', (req, res) => {
  const { title, content, name, school } = req.body;
  db.query(`
  INSERT IGNORE INTO posts (title, content, name, school) VALUES ('${title}', '${content}', '${name}', '${school}');
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {            
    res.send(true);
    res.end();
  } else {
    res.send(error);  
    res.end();
  }})
});

// GET /board/comments/:postId - 특정 게시물의 댓글 목록 가져오기
router.get('/comments/:postId', (req, res) => {
  var postId = parseInt(req.params.postId);
  console.log(postId)
  db.query(`
  select * from comments where post_id = '${postId}'
  `, function(error, result){
  if (error) {throw error}
  if (result.length > 0) {
    res.send(result);
    res.end();
  } else {
    res.send(error);  
    res.end();
  }})
});

// 댓글 입력하기
router.post('/comments', (req, res) => {
  const { postId, commentText, school, name, time } = req.body;
  const dateOnly = time.split("T")[0];
  console.log(postId, commentText, school, name, dateOnly)
  db.query(`
  INSERT IGNORE INTO comments (post_id, content, school, name, date) VALUES ('${postId}', '${commentText}', '${school}', '${name}', '${dateOnly}');
  `, function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {
    res.send(true);
    res.end();
  } else {
    res.send(error);  
    res.end();
  }})
});


module.exports = router;