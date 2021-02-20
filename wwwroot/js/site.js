// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

$(function () {
    var toasts = [];
    var refreshInterval;
  
    verifyToken()
  
    function verifyToken() {
      // check for existing token
      var token = Cookies.get('token');
      if (token) {
        // user has token
        // getEvents(1);

        // hide sign in link, show sign out link
        $('#signIn').hide();
        $('#signOut').show();

      } else {
        // show sign in link, hide sign out link
        $('#signIn').show();
        $('#signOut').hide();
        // display modal
        $('#signInModal').modal();
      }
    }
  
    function toast(header, text, icon) {
      // create unique id for toast using array length
      var id = toasts.length;
      // generate html for toast
      var toast = "<div id=\"" + id + "\" class=\"toast\" style=\"min-width:300px;\">" +
        "<div class=\"toast-header\">" +
        "<strong class=\"mr-auto\">" + header + "</strong><button type=\"button\" class=\"ml-2 mb-1 close\" data-dismiss=\"toast\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>" +
        "<div class=\"toast-body\"><i class=\"" + icon + "\"></i> " + text + "</div>" +
        "</div>";
      // append the toast html to toast container
      $('#toast_container').append(toast);
      // add toast id to array
      toasts.push(id);
      // show toast
      $('#' + id).toast({ delay: 1500 }).toast('show');
      // after toast has been hidden
      $('#' + id).on('hidden.bs.toast', function () {
        // remove toast from array
        toasts.splice(id);
        // remove toast from DOM
        $('#' + id).remove();
      });
    }
  
  
    function showErrors(errors) {
      for (var i = 0; i < errors.length; i++) {
        // apply bootstrap is-invalid class to any field with errors
        errors[i].addClass('is-invalid');
      }
      // shake modal for effect
      $('#signInModal').css('animation-duration', '0.7s')
      $('#signInModal').addClass('animate__animated animate__shakeX').on('animationend', function () {
        $(this).removeClass('animate__animated animate__shakeX');
      });
    }

    // delegated event handler needed
    // http://api.jquery.com/on/#direct-and-delegated-events
    $('tbody').on('click', '.flag', function () {
      var checked;
      if ($(this).data('checked')) {
        $(this).data('checked', false);
        $(this).removeClass('fas').addClass('far');
        checked = false;
      } else {
        $(this).data('checked', true);
        $(this).removeClass('far').addClass('fas');
        checked = true;
      }
      // AJAX to update database
      $.ajax({
        headers: { "Content-Type": "application/json", "Authorization": 'Bearer ' + Cookies.get('token') },
        // headers: { "Content-Type": "application/json" },
        url: "https://apimodas.azurewebsites.net//api/event/" + $(this).data('id'),
        type: 'patch',
        data: JSON.stringify([{ "op": "replace", "path": "Flagged", "value": checked }]),
        success: function () {
          // Toast
          toast("Update Complete", "Event flag " + (checked ? "added." : "removed."), "far fa-edit");
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // log the error to the console
          console.log("The following error occured: " + jqXHR.status, errorThrown);
        }
      });
    });
  
    $('#signIn a').on('click', function (e) {
      e.preventDefault();
      // display modal
      $('#signInModal').modal();
    });
  
    $('#signOut a').on('click', function (e) {
      e.preventDefault();
      // delete cookie
      Cookies.remove('token');
      // delete html from table body
      $('tbody').html("");
      // hide content
      $('#content').hide();
      // hide sign out link, show sign in link
      $('#signIn').show();
      $('#signOut').hide();
      // disable auto-refresh button
      $("#auto-refresh").prop("disabled", true);
      // if timer is running, clear it
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    });
  
    $("#signInModal").keypress(function (e) {
      if (e.keyCode === 13) {
        submitForm(e);
      }
    });
  
    $("#submitButton").click(function (e) {
      submitForm(e);
    });
  
  
    function submitForm(e) {
      // submitForm();
      e.preventDefault();
  
      // reset any fields marked with errors
      $('.form-control').removeClass('is-invalid');
      $("#errorLogin").empty();
      // create an empty errors array
      var errors = [];
      // check for empty username
      if ($('#username').val().length == 0) {
        errors.push($('#username'));
      }
      // check for empty password
      if ($('#password').val().length == 0) {
        errors.push($('#password'));
      }
      // username and/or password empty, display errors
      if (errors.length > 0) {
        showErrors(errors);
      } else {
        // verify username and password using the token api
        $.ajax({
          headers: { 'Content-Type': 'application/json' },
          url: "https://apimodas.azurewebsites.net//api/token",
          type: 'post',
          data: JSON.stringify({ "username": $('#username').val(), "password": $('#password').val() }),
          success: function (data) {
            // save token in a cookie
            Cookies.set('token', data["token"], { expires: 1 });
            // hide modal
            $('#signInModal').modal('hide');
            verifyToken();
          },
          error: function (jqXHR, textStatus, errorThrown) {
            // log the error to the console
            console.log("The following error occured: " + jqXHR.status, errorThrown);
            errors.push($('#username'));
            errors.push($('#password'));
            showErrors(errors);
            $("#errorLogin").text("Either username or password is WRONG!");          
  
          }
        });
      }
  
    }
  
  
  });
  