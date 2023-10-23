/**FUNCOES DO RELOGIO REGRESSIVO */


function configuraRelogioSorteioUnico(produto, id, prefixo) {

  if (prefixo == "HOME_") {
    $("#btn_comprar_p" + id).hide();
  }

  var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));
  //$("#div_produtos").hide();
  $("#" + prefixo + "div_produtos").hide();
  var date = novaDataJS(todosSorteios[produto].dados.data_sorteio, 'yyyy-mm-dd hh:mm:ss');
  var novaData = new Date();
  if (date > novaData) {
    //$("#" + prefixo + "relogio").attr("style", "display: contents !important;");
    if (app.device.firefox) {
      $("#" + prefixo + "relogio").attr("style", "height: 100px;");
    }
    else {
      $("#" + prefixo + "relogio").attr("style", "height: 80px;");
    }
    $("#" + prefixo + "dataSorteioOp" + id).text("Sorteio será realizado em:");
  }
  else {
    $("#" + prefixo + "relogio").hide();
  }
  setTimeout(function () {
    atualizaRelogio(todosSorteios[produto].dados.data_sorteio);
    labelRelogio();
  }, 600);
}

function atualizaRelogio(dataDoSorteio) {
  // DATA E HORA DO PROXIMO SORTEIO INFORMADO NO BANCO

  //var dataSorteio = new Date(dataDoSorteio);
  var dataSorteio = novaDataJS(dataDoSorteio, 'yyyy-mm-dd hh:mm:ss');
  var dataAgora = new Date();
  var diff = dataSorteio.getTime() / 1000 - dataAgora.getTime() / 1000;
  if (diff <= 0) {
    // Sorteio de hoje já passou, proximo ná proxima semana
    var dataSorteio = getNextWeekDay(new Date(), 7);
    var diff = dataSorteio.getTime() / 1000 - dataAgora.getTime() / 1000;
  }

  if (dayDiff(dataAgora, dataSorteio) < 100) {
    $('.clock').addClass('twoDayDigits');
  } else {
    $('.clock').addClass('threeDayDigits');
  }

  setTimeout(function () {
    var clock = $('.clock').FlipClock(diff, {
      clockFace: 'DailyCounter',
      countdown: true,
      autoStart: false,
      language: 'pt'
    });
    clock.setCountdown(true);
    clock.start();
  }, 1000);

}

function getNextWeekDay(startDate, dayOfWeek) {
  var dayOffset = dayOfWeek > startDate.getDay()
    ? dayOfWeek - startDate.getDay()
    : dayOfWeek - startDate.getDay() + 7;

  startDate.setDate(startDate.getDate() + dayOffset);
  startDate.setHours(09, 00, 00, 00);
  return startDate;
}

// Calculate day difference and apply class to .clock for extra digit styling.
function dayDiff(first, second) {
  return (second - first) / (1000 * 60 * 60 * 24);
}
/**FIM FUNCOES DO RELOGIO REGRESSIVO */


function labelRelogio() {
  if (app.device.ios) {
  }
  else {
    $(".flip-clock-label").each(function (index) {
      $(this).addClass('flip-android');
      if ($(this).text() == 'Segundos') {
        $(this).addClass('flip-segundos');
      }
      else if ($(this).text() == 'Minutos') {
        $(this).addClass('flip-minutos');
      }
      else if ($(this).text() == 'Horas') {
        $(this).addClass('flip-hora');
      }
      else if ($(this).text() == 'Dias') {
        $(this).addClass('flip-dia');
      }
    });
  }

}