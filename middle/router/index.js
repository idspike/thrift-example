const router = require('koa-router')();
const thrift = require('thrift');
const SaveList = require('../../thrift/gen-nodejs/SaveList');
const ttypes = require('../../thrift/gen-nodejs/list_types');
const createConnection = require('../utils/createConnection').createConnection;

router.post('/', async (ctx, next) => {

  // 因为复用度高，把创建connection的代码提取成一个方法
  const connection = createConnection();

  // 创建thrift服务
  var client = thrift.createClient(SaveList, connection);

  // thrift文件中定义的ping方法
  await client.ping(function(err, response) {
    console.log('ping in middle');
  });

  const date = Date.parse(new Date());

  // thrift文件中定义的save方法
  // 使用promise，等待回调函数执行完后返回response
  // 方式可能不是很优雅，之后可能进行封装
  ctx.body = await new Promise((resolve, reject) => {
    client.save(ctx.request.body.username, ctx.request.body.words, String(date), function(err, response) {
      console.log("middle get response from server:",response);
      resolve(response)
    });
  })

  // 返回给前端的参数
  return ctx.body;
});

module.exports = router;
