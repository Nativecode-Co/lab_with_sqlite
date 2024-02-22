import React from "react";

// import css

import "./assets/css/loader.css";
import "./assets/js/loader";
import "./assets/plugins/font-awesome/css/all.css";

import "./assets/css/plugins.css";

import "./assets/css/components/custom-modal.css";
import "./assets/css/forms/switches.css";
import "./assets/css/forms/theme-checkbox-radio.css";

import "./assets/css/style.css";
import "./assets/css/new_style.css";

import "./assets/css/invoice.css";

import { Outlet } from "react-router-dom";
import { Loader, Navbar } from "./components";

function Root() {
  // get window width
  const width = window.innerWidth;
  if (width < 2100) {
    // set zoom
    document.body.style.zoom = width / 2100;
  }
  return (
    <>
      <Navbar />
      <div className="main-container" id="container">
        <div id="content" className="main-content">
          <div className="layout-px-spacing">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default Root;
