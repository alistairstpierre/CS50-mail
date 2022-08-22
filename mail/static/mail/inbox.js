document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#send').addEventListener('click', send_email);
  document.querySelector('#compose-form').addEventListener('submit', compose_submit);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function send_email() {
  document.querySelector('#compose-form').dispatchEvent(new Event('submit'))
}

function compose_submit() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log("got it")
      var str = JSON.stringify(result, null, 2);
      console.log(str);
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  const emailView = document.querySelector('#emails-view');
  emailView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if(mailbox.localeCompare('inbox') == 0)
    fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {
          emails.forEach(email => {
            if(email.read == false)
              emailView.innerHTML += `<div class="border border-secondary rounded p-3 my-1 email bg-secondary text-light" id="temp"> <p>${email.sender}</p> <p>${email.subject}</p> <p>${email.timestamp}</p></div>`
            else
              emailView.innerHTML += `<div class="border border-secondary rounded p-3 my-1 email bg-white" id="temp"> <p>${email.sender}</p> <p>${email.subject}</p> <p>${email.timestamp}</p></div>`
            var element = document.getElementById("temp");
            element.id = email.id
          });
      });

  if(mailbox.localeCompare('sent') == 0)
    fetch('/emails/sent')
      .then(response => response.json())
      .then(emails => {
          // Print emails
          console.log(emails);

          // ... do something else with emails ...
      });

  if(mailbox.localeCompare('archive') == 0)
      fetch('/emails/archive')
        .then(response => response.json())
        .then(emails => {
            // Print emails
            console.log(emails);
  
            // ... do something else with emails ...
        });

  emailView.addEventListener('click', (event) => {
    if(event.target.id.length !== 0) {
      var id = parseInt(event.target.id)
      if(!isNaN(id)) 
        load_email(id)
    }
    else {
      console.log(event.target.parentElement.id)
      var id = parseInt(event.target.parentElement.id)
      if(!isNaN(id)) 
        load_email(id)
    }
  });
}

function load_email(id) {
  const emailView = document.querySelector('#emails-view');

  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        // Print emails
        console.log(email);
        emailView.innerHTML = `<h3>${email.subject}</h3>`;
        emailView.innerHTML += `<p>${email.sender}</p>`;
        emailView.innerHTML += `<p>${email.recipients}</p>`;
        emailView.innerHTML += `<p>${email.body}</p>`;
        // ... do something else with emails ...
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: false
          })
        })
        
    });
}