jQuery(function () {

  badgeCompraSemana('resultadosanteriores-badge-qtd-comprada'); // cada pagina tem um id
  badgeCarrinhoEmAberto('resultadosanteriores-badge-qtd-carrinho');// cada pagina tem um id

  if (device.platform == 'WEBAPP') {
    var bodyW = $("#body").width();
    var appW = $("#app").width();
  }
  var page_content_resultadosanteriores = $("#page_content_resultadosanteriores").height();
  $("#iframe_resultadosanteriores").height(page_content_resultadosanteriores + 'px')

  // iframe demora a carregar, portanto, aguarda 2,5 segundo e fecha a msg.
  app.dialog.preloader();
  setTimeout(function () {
    app.dialog.close();
  }, 2500);


});