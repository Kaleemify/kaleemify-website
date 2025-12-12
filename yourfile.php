<?php
if($_SERVER["REQUEST_METHOD"] == "POST"){
    $name = $_POST['name'];
    $email = $_POST['email'];

    // Email send karna
    mail("kaleemify@gmail.com", "New Form Submission", "Name: $name, Email: $email");
    echo "Form submitted successfully!";
}
?>
