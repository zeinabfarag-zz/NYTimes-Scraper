function saveArticle() {
  var title = $("#link").text();
  var link = $("#link").attr("href");
  var summary = $("#summary").text();

  var saveArticle = { title: title, link: link, summary: summary };
  var finalSave = JSON.stringify(saveArticle);

  $.ajax({
    url: "/saved",
    type: "POST",
    data: finalSave,
    dataType: "json",
    contentType: "application/json",
    success: function(data) {
      console.log(data);
    },
    error: function(err) {
      console.log("ERROR: ", err);
    }
  });
}
