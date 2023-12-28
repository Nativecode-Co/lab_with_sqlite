var g01_a = 0;
var g01_b = 0;
var g01_c = 0;
var g01_d = 0;
var g2_a = 0;
var g2_b = 0;
var g2_c = 0;
var g2_d = 0;
var g3_a = 0;
var g3_b = 0;
var g3_c = 0;
var g4_a = 0;
var g4_b = 0;
var g4_c = 0;
var g4_d = 0;
var g5_a = 0;
var g5_b = 0;
var g5_c = 0;
var g5_d = 0;
var g6_a = 0;
var g6_b = 0;
var g6_c = 0;
var g6_d = 0;
var g6_e = 0;
var g7_a = 0;
var g7_b = 0;
var g7_c = 0;
var g7_d = 0;
var g7_e = 0;
var g7_f = 0;
var g8_a = 0;
var g8_b = 0;
var g8_c = 0;
var g8_d = 0;
var g9_a = 0;
var g9_b = 0;
var g9_c = 0;
var g9_d = 0;
var g9_e = 0;
var g9_f = 0;
var g10_a = 0;
var g10_b = 0;
var g10_c = 0;
var g10_d = 0;
var g10_e = 0;
var g11_a = 0;
var g11_b = 0;
var g11_c = 0;
var g11_d = 0;
var g11_e = 0;
var _g01 = 0;
var _g2 = 0;
var _g3 = 0;
var _g4 = 0;
var _g5 = 0;
var _g6 = 0;
var _g7 = 0;
var _g8 = 0;
var _g9 = 0;
var _g10 = 0;
var _g11 = 0;
$("#form_evolution").on("change", "input[type='number']", function() {
    g01_a = 0;
    g01_b = 0;
    g01_c = 0;
    g01_d = 0;
    g2_a = 0;
    g2_b = 0;
    g2_c = 0;
    g2_d = 0;
    g3_a = 0;
    g3_b = 0;
    g3_c = 0;
    g4_a = 0;
    g4_b = 0;
    g4_c = 0;
    g4_d = 0;
    g5_a = 0;
    g5_b = 0;
    g5_c = 0;
    g5_d = 0;
    g6_a = 0;
    g6_b = 0;
    g6_c = 0;
    g6_d = 0;
    g6_e = 0;
    g7_a = 0;
    g7_b = 0;
    g7_c = 0;
    g7_d = 0;
    g7_e = 0;
    g7_f = 0;
    g8_a = 0;
    g8_b = 0;
    g8_c = 0;
    g8_d = 0;
    g9_a = 0;
    g9_b = 0;
    g9_c = 0;
    g9_d = 0;
    g9_e = 0;
    g9_f = 0;
    g10_a = 0;
    g10_b = 0;
    g10_c = 0;
    g10_d = 0;
    g10_e = 0;
    g11_a = 0;
    g11_b = 0;
    g11_c = 0;
    g11_d = 0;
    g11_e = 0;
    $('input[id^=g01_a]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g01_a += parseInt(this.value, 10);
    });
    //console.log("aaas",totalg01_a);
    $('input[id^=g01_b]').each(function() {
        //  console.log(this.value);
        //alert("dddd");
        if (!isNaN(parseInt(this.value)))
            g01_b += parseInt(this.value, 10);
    });
    $('input[id^=g01_c]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g01_c += parseInt(this.value, 10);
    })
    $('input[id^=g01_d]').each(function() {
            //  console.log(this.value);
            if (!isNaN(parseInt(this.value)))
                g01_d += parseInt(this.value, 10);
        })
        /////////////////////////////////////////////01
        /////////////////////////////////////////////
    $('input[id^=g2_a]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g2_a += parseInt(this.value, 10);
    });
    $('input[id^=g2_b]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g2_b += parseInt(this.value, 10);
    });
    $('input[id^=g2_c]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g2_c += parseInt(this.value, 10);
    })
    $('input[id^=g2_d]').each(function() {
            //  console.log(this.value);
            if (!isNaN(parseInt(this.value)))
                g2_d += parseInt(this.value, 10);
        })
        /////////////////////////////////////////////2
        /////////////////////////////////////////////
    $('input[id^=g3_a]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g3_a += parseInt(this.value, 10);
    });
    $('input[id^=g3_b]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g3_b += parseInt(this.value, 10);
    });
    $('input[id^=g3_c]').each(function() {
            //  console.log(this.value);
            if (!isNaN(parseInt(this.value)))
                g3_c += parseInt(this.value, 10);
        })
        /////////////////////////////////////////////3
        /////////////////////////////////////////////
    $('input[id^=g4_a]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g4_a += parseInt(this.value, 10);
    });
    $('input[id^=g4_b]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g4_b += parseInt(this.value, 10);
    });
    $('input[id^=g4_c]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g4_c += parseInt(this.value, 10);
    })
    $('input[id^=g4_d]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g4_d += parseInt(this.value, 10);
    });
    /////////////////////////////////////////////4
    /////////////////////////////////////////////
    $('input[id^=g5_a]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g5_a += parseInt(this.value, 10);
    });
    $('input[id^=g5_b]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g5_b += parseInt(this.value, 10);
    });
    $('input[id^=g5_c]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g5_c += parseInt(this.value, 10);
    })
    $('input[id^=g5_d]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g5_d += parseInt(this.value, 10);
    });
    /////////////////////////////////////////////5
    /////////////////////////////////////////////
    $('input[id^=g6_a]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g6_a += parseInt(this.value, 10);
    });
    $('input[id^=g6_b]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g6_b += parseInt(this.value, 10);
    });
    $('input[id^=g6_c]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g6_c += parseInt(this.value, 10);
    })
    $('input[id^=g6_d]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g6_d += parseInt(this.value, 10);
    })
    $('input[id^=g6_e]').each(function() {
            //  console.log(this.value);
            if (!isNaN(parseInt(this.value)))
                g6_e += parseInt(this.value, 10);
        })
        /////////////////////////////////////////////6
        /////////////////////////////////////////////
    $('input[id^=g7_a]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g7_a += parseInt(this.value, 10);
    });
    $('input[id^=g7_b]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g7_b += parseInt(this.value, 10);
    });
    $('input[id^=g7_c]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g7_c += parseInt(this.value, 10);
    })
    $('input[id^=g7_d]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g7_d += parseInt(this.value, 10);
    })
    $('input[id^=g7_e]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g7_e += parseInt(this.value, 10);
    })
    $('input[id^=g7_f]').each(function() {
            //  console.log(this.value);
            if (!isNaN(parseInt(this.value)))
                g7_f += parseInt(this.value, 10);
        })
        /////////////////////////////////////////////7
        /////////////////////////////////////////////
    $('input[id^=g8_a]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g8_a += parseInt(this.value, 10);
    });
    $('input[id^=g8_b]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g8_b += parseInt(this.value, 10);
    });
    $('input[id^=g8_c]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g8_c += parseInt(this.value, 10);
    })
    $('input[id^=g8_d]').each(function() {
            //  console.log(this.value);
            if (!isNaN(parseInt(this.value)))
                g8_d += parseInt(this.value, 10);
        })
        /////////////////////////////////////////////8
        /////////////////////////////////////////////
    $('input[id^=g9_a]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g9_a += parseInt(this.value, 10);
    });
    $('input[id^=g9_b]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g9_b += parseInt(this.value, 10);
    });
    $('input[id^=g9_c]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g9_c += parseInt(this.value, 10);
    })
    $('input[id^=g9_d]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g9_d += parseInt(this.value, 10);
    })
    $('input[id^=g9_e]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g9_e += parseInt(this.value, 10);
    })
    $('input[id^=g9_f]').each(function() {
            //  console.log(this.value);
            if (!isNaN(parseInt(this.value)))
                g9_f += parseInt(this.value, 10);
        })
        /////////////////////////////////////////////9
        /////////////////////////////////////////////
    $('input[id^=g10_a]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g10_a += parseInt(this.value, 10);
    });
    $('input[id^=g10_b]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g10_b += parseInt(this.value, 10);
    });
    $('input[id^=g10_c]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g10_c += parseInt(this.value, 10);
    })
    $('input[id^=g10_d]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g10_d += parseInt(this.value, 10);
    })
    $('input[id^=g10_e]').each(function() {
            //  console.log(this.value);
            if (!isNaN(parseInt(this.value)))
                g10_e += parseInt(this.value, 10);
        })
        /////////////////////////////////////////////10
        /////////////////////////////////////////////
    $('input[id^=g11_a]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g11_a += parseInt(this.value, 10);
    });
    $('input[id^=g11_b]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g11_b += parseInt(this.value, 10);
    });
    $('input[id^=g11_c]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g11_c += parseInt(this.value, 10);
    })
    $('input[id^=g11_d]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            g11_d += parseInt(this.value, 10);
    })
    $('input[id^=g11_e]').each(function() {
            //  console.log(this.value);
            if (!isNaN(parseInt(this.value)))
                g11_e += parseInt(this.value, 10);
        })
        /////////////////////////////////////////////11
    $("#_g01_a").val(g01_a);
    $("#_g01_b").val(g01_b);
    $("#_g01_c").val(g01_c);
    $("#_g01_d").val(g01_d);
    $("#_g2_a").val(g2_a);
    $("#_g2_b").val(g2_b);
    $("#_g2_c").val(g2_c);
    $("#_g2_d").val(g2_d);
    $("#_g3_a").val(g3_a);
    $("#_g3_b").val(g3_b);
    $("#_g3_c").val(g3_c);
    $("#_g4_a").val(g4_a);
    $("#_g4_b").val(g4_b);
    $("#_g4_c").val(g4_c);
    $("#_g4_d").val(g4_d);
    $("#_g6_a").val(g6_a);
    $("#_g6_b").val(g6_b);
    $("#_g6_c").val(g6_c);
    $("#_g6_d").val(g6_d);
    $("#_g6_e").val(g6_e);
    $("#_g7_a").val(g7_a);
    $("#_g7_b").val(g7_b);
    $("#_g7_c").val(g7_c);
    $("#_g7_d").val(g7_d);
    $("#_g7_e").val(g7_e);
    $("#_g7_f").val(g7_f);
    $("#_g8_a").val(g8_a);
    $("#_g8_b").val(g8_b);
    $("#_g8_c").val(g8_c);
    $("#_g8_d").val(g8_d);
    $("#_g9_a").val(g9_a);
    $("#_g9_b").val(g9_b);
    $("#_g9_c").val(g9_c);
    $("#_g9_d").val(g9_d);
    $("#_g9_e").val(g9_e);
    $("#_g9_f").val(g9_f);
    $("#_g10_a").val(g10_a);
    $("#_g10_b").val(g10_b);
    $("#_g10_c").val(g10_c);
    $("#_g10_d").val(g10_d);
    $("#_g10_e").val(g10_e);
    $("#_g11_a").val(g11_a);
    $("#_g11_b").val(g11_b);
    $("#_g11_c").val(g11_c);
    $("#_g11_d").val(g11_d);
    $("#_g11_e").val(g11_e);
    // document.getElementById("_g01_a").value=g01_a;
    // document.getElementById("_g01_b").value=g01_b;
    // document.getElementById("_g01_c").value=g01_c;
    // document.getElementById("_g01_d").value=g01_d;
    // document.getElementById("_g2_a").value=g2_a;
    // document.getElementById("_g2_b").value=g2_b;
    // document.getElementById("_g2_c").value=g2_c;
    // document.getElementById("_g2_d").value=g2_d;
    // document.getElementById("_g3_a").value=g3_a;
    // document.getElementById("_g3_b").value=g3_b;
    // document.getElementById("_g3_c").value=g3_c;
    // document.getElementById("_g4_a").value=g4_a;
    // document.getElementById("_g4_b").value=g4_b;
    // document.getElementById("_g4_c").value=g4_c;
    // document.getElementById("_g4_d").value=g4_d;
    // document.getElementById("_g5_a").value=g5_a;
    // document.getElementById("_g5_b").value=g5_b;
    // document.getElementById("_g5_c").value=g5_c;
    // document.getElementById("_g5_d").value=g5_d;
    // document.getElementById("_g6_a").value=g6_a;
    // document.getElementById("_g6_b").value=g6_b;
    // document.getElementById("_g6_c").value=g6_c;
    // document.getElementById("_g6_d").value=g6_d;
    // document.getElementById("_g6_e").value=g6_e;
    // document.getElementById("_g7_a").value=g7_a;
    // document.getElementById("_g7_b").value=g7_b;
    // document.getElementById("_g7_c").value=g7_c;
    // document.getElementById("_g7_d").value=g7_d;
    // document.getElementById("_g7_e").value=g7_e;
    // document.getElementById("_g7_f").value=g7_f;
    // document.getElementById("_g8_a").value=g8_a;
    // document.getElementById("_g8_b").value=g8_b;
    // document.getElementById("_g8_c").value=g8_c;
    // document.getElementById("_g8_d").value=g8_d;
    // document.getElementById("_g9_a").value=g9_a;
    // document.getElementById("_g9_b").value=g9_b;
    // document.getElementById("_g9_c").value=g9_c;
    // document.getElementById("_g9_d").value=g9_d;
    // document.getElementById("_g9_e").value=g9_e;
    // document.getElementById("_g9_f").value=g9_f;
    // document.getElementById("_g10_a").value=g10_a;
    // document.getElementById("_g10_b").value=g10_b;
    // document.getElementById("_g10_c").value=g10_c;
    // document.getElementById("_g10_d").value=g10_d;
    // document.getElementById("_g10_e").value=g10_e;
    // document.getElementById("_g11_a").value=g11_a;
    // document.getElementById("_g11_b").value=g11_b;
    // document.getElementById("_g11_c").value=g11_c;
    // document.getElementById("_g11_d").value=g11_d;
    // document.getElementById("_g11_e").value=g11_e;
    _g01 = 0;
    _g2 = 0;
    _g3 = 0;
    _g4 = 0;
    _g5 = 0;
    _g6 = 0;
    _g7 = 0;
    _g8 = 0;
    _g9 = 0;
    _g10 = 0;
    _g11 = 0;
    $('input[id^=_g01]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            _g01 += parseInt(this.value, 10);
    })
    $('input[id^=_g2]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            _g2 += parseInt(this.value, 10);
    })
    $('input[id^=_g3]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            _g3 += parseInt(this.value, 10);
    })
    $('input[id^=_g4]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            _g4 += parseInt(this.value, 10);
    })
    $('input[id^=_g5]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            _g5 += parseInt(this.value, 10);
    })
    $('input[id^=_g6]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            _g6 += parseInt(this.value, 10);
    })
    $('input[id^=_g7]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            _g7 += parseInt(this.value, 10);
    })
    $('input[id^=_g8]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            _g8 += parseInt(this.value, 10);
    })
    $('input[id^=_g9]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            _g9 += parseInt(this.value, 10);
    })
    $('input[id^=_g10]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            _g10 += parseInt(this.value, 10);
    })
    $('input[id^=_g11]').each(function() {
        //  console.log(this.value);
        if (!isNaN(parseInt(this.value)))
            _g11 += parseInt(this.value, 10);
    })
    $("#branch_g01").val(_g01);
    $("#branch_g2").val(_g2);
    $("#branch_g3").val(_g3);
    $("#branch_g4").val(_g4);
    $("#branch_g5").val(_g5);
    $("#branch_g6").val(_g6);
    $("#branch_g7").val(_g7);
    $("#branch_g8").val(_g8);
    $("#branch_g9").val(_g9);
    $("#branch_g10").val(_g10);
    $("#branch_g11").val(_g11);
    //calculate all 
    $("#total_vland").html(_g01 + _g2 + _g3 + _g4 + _g5 + _g6 + _g7 + _g8 + _g9 + _g10 + _g11);
    // document.getElementById("branch_g01").value=_g01;
    // document.getElementById("branch_g2").value=_g2;
    // document.getElementById("branch_g3").value=_g3;
    // document.getElementById("branch_g4").value=_g4;
    // document.getElementById("branch_g5").value=_g5;
    // document.getElementById("branch_g6").value=_g6;
    // document.getElementById("branch_g7").value=_g7;
    // document.getElementById("branch_g8").value=_g8;
    // document.getElementById("branch_g9").value=_g9;
    // document.getElementById("branch_g10").value=_g10;           
    // document.getElementById("branch_g11").value=_g11;          
});
/////////////////////////////////////////////