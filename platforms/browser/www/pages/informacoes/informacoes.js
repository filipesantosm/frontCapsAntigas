jQuery(function () {
  // Badge - Sinalização de Compra e de itens no rcarrinho
  badgeCompraSemana('informacoes-badge-qtd-comprada'); // cada pagina tem um id
  badgeCarrinhoEmAberto('informacoes-badge-qtd-carrinho');// cada pagina tem um id

  app.preloader.hide();
  app.dialog.close();

  $("#logout").on("click", function () {
    app.dialog.preloader('Aguarde...');
    logoff('s');
  });

  $("#infoPolPrivacidade").on("click", function () {
    if (device.platform != 'WEBAPP') {
      var url = $(this).attr("href");
      window.open(url, '_blank');
    }
  });

  //Atualiza Telefone de suporte Whatsapp
  var novoTelSuporte = 'https://wa.me/' + localStorage.getItem("telSuporte") + '/?text=Ol%c3%a1%21%20Gostaria%20de%20algumas%20informa%c3%a7%c3%b5es.';
  $("#informacoes_suporteWA").attr("href", novoTelSuporte);


  // Calculo de data não utilizados
  /*
  var dataHoraAgora = new Date();
  var dataHoraFinal = new Date();

  dataHoraFinal.setHours(dataHoraFinal.getHours() + 0);
  dataHoraFinal.setMinutes(dataHoraFinal.getMinutes() + 0);
  dataHoraFinal.setSeconds(dataHoraFinal.getSeconds() + 15);
  var tempo = diferencaHoras(dataHoraAgora, dataHoraFinal, 'm:s');
  //console.log(tempo);
  */
  // * Verifica se a hora inicial é menor que a final. // Não utilizadas
  function isHoraInicialMenorHoraFinal(horaInicial, horaFinal) {
    var horaIni = horaInicial.split(':'); horaFim = horaFinal.split(':');
    // Verifica as horas. Se forem diferentes, é só ver se a inicial 
    // é menor que a final. 
    var hIni = parseInt(horaIni[0], 10);
    var hFim = parseInt(horaFim[0], 10);
    if (hIni != hFim)
      return hIni < hFim;

    // Se as horas são iguais, verifica os minutos então. 
    var mIni = parseInt(horaIni[1], 10);
    var mFim = parseInt(horaFim[1], 10);
    if (mIni != mFim)
      return mIni < mFim;
  }
  // Corrige data com 2 digitos  // Não utilizadas
  function corrigeDataHora2Digitos(val) {
    return (val < 10) ? '0' + val : val;
  }
  // Retona a diferença entre duas horas.   // Não utilizadas
  function diferencaHoras(horaInicial, horaFinal, padrao) {

    var h = horaInicial.getHours();
    var m = horaInicial.getMinutes();
    var s = horaInicial.getSeconds();
    var horaInicial = corrigeDataHora2Digitos(h) + ':' + corrigeDataHora2Digitos(m) + ':' + corrigeDataHora2Digitos(s);

    var h = horaFinal.getHours();
    var m = horaFinal.getMinutes();
    var s = horaFinal.getSeconds();
    var horaFinal = corrigeDataHora2Digitos(h) + ':' + corrigeDataHora2Digitos(m) + ':' + corrigeDataHora2Digitos(s);

    // Tratamento se a hora inicial é menor que a final 
    if (!isHoraInicialMenorHoraFinal(horaInicial, horaFinal)) {
      var aux = horaFinal;
      horaFinal = horaInicial;
      horaInicial = aux;
    }
    var hIni = horaInicial.split(':');
    var hFim = horaFinal.split(':');
    var horasTotal = parseInt(hFim[0], 10) - parseInt(hIni[0], 10);
    var minutosTotal = parseInt(hFim[1], 10) - parseInt(hIni[1], 10);
    var segundosTotal = parseInt(hFim[2], 10) - parseInt(hIni[2], 10);

    if (segundosTotal < 0) {
      segundosTotal += 60; minutosTotal -= 1;
    }
    if (minutosTotal < 0) {
      minutosTotal += 60; horasTotal -= 1;
    }
    if (horasTotal < 0) {
      horasTotal += 24; minutosTotal -= 1;
    }

    if (padrao == 'h:m:s') {
      horaFinal = corrigeDataHora2Digitos(horasTotal) + ":" + corrigeDataHora2Digitos(minutosTotal) + ":" + corrigeDataHora2Digitos(segundosTotal);
    }
    else if (padrao == 'h:m') {
      horaFinal = corrigeDataHora2Digitos(horasTotal) + ":" + corrigeDataHora2Digitos(minutosTotal);
    }
    else if (padrao == 'm:s') {
      horaFinal = corrigeDataHora2Digitos(minutosTotal) + ":" + corrigeDataHora2Digitos(segundosTotal);
    }
    return horaFinal;
  }
  ocultarConformeLocal('li_ComprarSaldo');
  if (habilitarBoleto == 'n') {
    $("#li_ComprarSaldo").hide();
  }
  else {
    $("#li_ComprarSaldo").show();
  }

});