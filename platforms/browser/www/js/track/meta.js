
track1('meta', 'addCarrinho');
track1('meta', 'contato');

function track1(op, rota, addget = "") {
  var trackidMeta = '4408808522471632';
  var getUrl = "?trackid=" + trackidMeta;
  if (addget != '') {
    getUrl = getUrl + addget;
  }
  var rotaObj = {};
  rotaObj.home = 'home.php';
  rotaObj.contato = 'contato.php';
  rotaObj.checkout = 'checkout.php';
  rotaObj.cadastro = 'cadastro.php';
  rotaObj.addCarrinho = 'add_carrinho.php';
  rotaObj.abrirCarrinho = 'abrir_carrinho.php';
  const options = { method: 'GET' };
  if (op == 'meta') {
    var url = "https://loja.supercapsp.com.br/__track__/meta/" + rotaObj[rota] + getUrl;
  }

  app.request.promise.get(url, { trackid: trackidMeta })
    .then(function (res) {
      console.log('Load was performed');
    })
    .catch(function (err) {
      console.log(err.xhr)
      console.log(err.status)
      console.log(err.message)
    })

}

function track2(op, rota, addget = "") {
  var trackidMeta = '4408808522471632';
  var getUrl = "?trackid=" + trackidMeta;
  if (addget != '') {
    getUrl = getUrl + addget;
  }
  var rotaObj = {};
  rotaObj.home = 'home.php';
  rotaObj.contato = 'contato.php';
  rotaObj.checkout = 'checkout.php';
  rotaObj.cadastro = 'cadastro.php';
  rotaObj.addCarrinho = 'add_carrinho.php';
  rotaObj.abrirCarrinho = 'abrir_carrinho.php';
  const options = { method: 'GET' };
  if (op == 'meta') {
    var url = "https://loja.supercapsp.com.br/__track__/meta/" + rotaObj[rota] + getUrl;
  }
  app.request({
    url: url,
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("jwt"));
      request.setRequestHeader("chaveapp", chaveAPP);
      request.setRequestHeader("versaoapp", versaoAPP);
    },
    async: false,
    method: 'GET',
    dataType: 'json',
    data: {
      trackid: trackidMeta
    },
    success: function (resposta) {
      console.log(resposta);
    },
    error: function (erro) {
      console.log('erro', erro);
      //ErroAjax('error', 'conexao/servidor', 's');
    },
    complete: function () { }
  });
}