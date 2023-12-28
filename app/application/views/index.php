<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Bootstrap Example</title>
    <meta charset="utf-8">

    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="<?php echo base_url(); ?>style/style.css">

    <link href="https://fonts.googleapis.com/css?family=Cairo&display=swap" rel="stylesheet">

    <style>
        body,h1,h2,h3,h4,p{
            font-family: 'Cairo', sans-serif !important;
        }
    </style>
</head>
<body>
<header></header>
<div class="container">
    <!--animations form-->
    <form class="pick-animation my-4"  >
        <div class="form-row">
            <div class="col-5 m-auto">
                <select class="pick-animation__select form-control" style="display:none">
                    <option value="scaleIn" selected="selected">ScaleIn</option>
                    <option value="scaleOut">ScaleOut</option>
                    <option value="slideHorz">SlideHorz</option>
                    <option value="slideVert">SlideVert</option>
                    <option value="fadeIn">FadeIn</option>
                </select>
            </div>
        </div>
    </form>

    <div class="container">
        <!--multisteps-form-->
        <div class="multisteps-form">
            <!--progress bar-->
            <div class="row">
                <div class="col-12 col-lg-8 ml-auto mr-auto mb-4">
                    <div class="multisteps-form__progress">
                        <button class="multisteps-form__progress-btn js-active" type="button" title="User Info">User Info</button>
                        <button class="multisteps-form__progress-btn" type="button" title="Address">Address</button>
                        <button class="multisteps-form__progress-btn" type="button" title="Order Info">Order Info</button>
                        <button class="multisteps-form__progress-btn" type="button" title="Comments">Comments        </button>
                    </div>
                </div>
            </div>
            <!--form panels-->
            <div class="row">
                <div class="col-12 col-lg-8 m-auto">
                    <form class="multisteps-form__form" action="<?php  echo site_url("Seller/add_post");?>" method="post" enctype="multipart/form-data" >
                        <!--single form panel-->
                        <div class="multisteps-form__panel shadow p-4 rounded bg-white js-active" data-animation="scaleIn">
                            <h3 class="multisteps-form__title">Take a Picture</h3>
                            <div class="multisteps-form__content">
                                <div class="form-row mt-4">
                                    <div class="col-12 col-sm-12">
                                        <input class="multisteps-form__input form-control" type="file" name="files[]" multiple />
                                    </div>
                                </div>

                                <div class="button-row d-flex mt-4">
                                    <button class="btn btn-primary ml-auto js-btn-next" type="button" title="Next">Next</button>
                                </div>
                            </div>
                        </div>




                        <!--single form panel-->
                        <div class="multisteps-form__panel shadow p-4 rounded bg-white" data-animation="scaleIn">
                            <h3 class="multisteps-form__title">Item Info</h3>
                            <div class="multisteps-form__content">
                                <div class="form-row mt-4">
                                    <div class="col">
                                        <input class="multisteps-form__input form-control" type="text" placeholder="Item Name" name="title"/>
                                    </div>
                                </div>
                                <div class="form-row mt-4">

                                <textarea class="multisteps-form__textarea form-control" placeholder="Description about Item" name="description"></textarea>
                                 
                                    
                                </div>

                                <div class="button-row d-flex mt-4">
                                    <button class="btn btn-primary js-btn-prev" type="button" title="Prev">Prev</button>
                                    <button class="btn btn-primary ml-auto js-btn-next" type="button" title="Next">Next</button>
                                </div>
                            </div>
                        </div>



                        <!--single form panel-->
                        <div class="multisteps-form__panel shadow p-4 rounded bg-white" data-animation="scaleIn">
                            <h3 class="multisteps-form__title">Address</h3>
                            <div class="multisteps-form__content">
                                <div class="row">
                                    <div class="col-12 col-md-12 mt-4">
                                        <div class="card shadow-sm">
                                            <div class="card-body">
                                                <h5 class="card-title">Pick your Location</h5>
                                                <p class="card-text" id="demo"></p>
                                                <a class="btn btn-primary" onclick="getLocation()" href="#" title="Item Link">Get My Address</a>
                                                <input type="hidden" name="location_lat" id="location_lat" />
                                                <input type="hidden" name="location_long" id="location_long" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-12 mt-4">
                                        <div class="card shadow-sm">
                                            <div class="card-body">
                                                <h5 class="card-title">Or Provide your Address</h5>

                                                <input class="multisteps-form__input form-control" type="text" name="address" placeholder="Your Address"/>                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="button-row d-flex mt-4 col-12">
                                        <button class="btn btn-primary js-btn-prev" type="button" title="Prev">Prev</button>
                                        <button class="btn btn-primary ml-auto js-btn-next" type="button" title="Next">Next</button>
                                    </div>
                                </div>
                            </div>
                        </div>




                        <!--single form panel-->
                        <div class="multisteps-form__panel shadow p-4 rounded bg-white" data-animation="scaleIn">
                            <h3 class="multisteps-form__title">Price Of Item</h3>
                            <div class="multisteps-form__content">
                                <div class="form-row mt-4">
                                    <div class="col">
                                        <input class="multisteps-form__input form-control" type="text" placeholder="Price" name="price"/>
                                    </div>                                </div>
                                <div class="button-row d-flex mt-4">
                                    <button class="btn btn-primary js-btn-prev" type="button" title="Prev">Prev</button>
                                    <button class="btn btn-success ml-auto" type="submit" title="Send">Send</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

</div>
<script  src="<?php echo base_url(); ?>style/script.js"></script>
<script>
    var x = document.getElementById("demo");

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(showPosition);
        } else {
            x.innerHTML = "Geolocation is not supported by this browser.";
        }
    }

    function showPosition(position) {
        x.innerHTML="Latitude: " + position.coords.latitude +
            "<br>Longitude: " + position.coords.longitude;
            document.getElementById("location_lat").value=position.coords.latitude;
            document.getElementById("location_long").value=position.coords.longitude;
    }
</script>
</body>
</html>

