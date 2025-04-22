document.getElementById('support-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const issueType = document.getElementById('issue-type').value;
    const subject = document.getElementById('subject').value;
    const description = document.getElementById('description').value;
    const email = document.getElementById('email').value;

    // Simulate form submission (in a real app, this would send to a backend)
    console.log("Form submitted:", { issueType, subject, description, email });
    alert("Your request has been submitted. phorumass support will contact you soon.");
});