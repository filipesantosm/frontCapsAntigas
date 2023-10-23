jQuery(function () {
  var ktmp = Date.now();
  app.dialog.preloader();
  //PUSH PARA ATUALIZAR
  var $ptrContent = $$('.ptr-content');
  // Add 'refresh' listener on it
  $ptrContent.on('ptr:refresh', function (e) {
    setTimeout(function () {
      app.view.current.router.refreshPage();
    }, 100);
  });
  var dataC = {
    user_login: localStorage.getItem("user_login")
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);
  app.request({
    url: servidor + '/api_public/institucional/sorteio_ao_vivo.php',
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("jwt"));
      request.setRequestHeader("chaveapp", chaveAPP);
      request.setRequestHeader("versaoapp", versaoAPP);
    },
    //async: false,
    method: 'POST',
    dataType: 'json',
    crossDomain: true,
    data: {
      a: JSON.stringify(criptoDadosEnviado(ktmp, ktmp)),
      c: dataC,
      d: dataD
    },
    success: function (resposta) {
      app.dialog.close();
      app.preloader.hide();
      var resp = descriptDadosRecebido(resposta, ktmp);
      var respMerge = { ...resp.d, ...resp.c, ...resp.a };
      if (respMerge.status == "ok") {
        var novoTextoHTML = dimensaoIframeVideo(respMerge.dadosHtml);
        if (respMerge.tipo == "aovivo") {
          $("#card-comercial").hide();
          $("#card-aovivo").show();
          $("#video-aovivo-html").append(novoTextoHTML);
        }
        else{
          $("#card-aovivo").hide();
          $("#card-comercial").show();
          var dadosSorteioAberto = JSON.parse(localStorage.getItem("dadosSorteioAberto"));
          var arrayDataSorteio = dadosSorteioAberto.data_sorteio.split(' ');
          var hora = arrayDataSorteio[1].split(':')[0];
          var min = arrayDataSorteio[1].split(':')[1];
          var data_sorteio = arrayDataSorteio[0].split('-').reverse().join('/').toString();
          var data_sorteioCAB = data_sorteio + " às " + hora + ":" + min;

          $("#titulo_comercial").text(data_sorteioCAB);
          $("#video-comercial-html").append(novoTextoHTML);
        }
      }
      else {
        ErroAjax(respMerge);
        return false;
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor','s');
      //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_023)','s');
    },
  });

});