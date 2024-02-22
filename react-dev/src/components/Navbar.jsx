import React from 'react';
// import images
import { Link } from 'react-router-dom';
import logo from '../assets/image/flask.png';

const Navbar = () => {
    return (
        <div className="header-container">
            <header className="header navbar navbar-expand-sm">
                <a type="button" className="sidebarCollapse" data-placement="bottom"><svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1={3} y1={12} x2={21} y2={12} /><line x1={3} y1={6} x2={21} y2={6} /><line x1={3} y1={18} x2={21} y2={18} /></svg></a>
                <div className="nav-logo align-self-center">
                    <Link className="navbar-brand" to="/"><img alt="logo" src={logo} /> <span className="navbar-brand-name">الموقع</span></Link>
                </div>
                <ul className="navbar-item topbar-navigation">
                    {/*  BEGIN TOPBAR  */}
                    <div className="topbar-nav header navbar" role="banner">
                        <nav id="topbar">
                            <ul className="navbar-nav theme-brand flex-row  text-center">
                                <li className="nav-item theme-logo">
                                    <a href="profile.html">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/640px-Image_created_with_a_mobile_phone.png" className="navbar-logo" alt="logo" />
                                    </a>
                                </li>
                                <li className="nav-item theme-text">
                                    <a href="profile.html" className="nav-link"> الموقع </a>
                                </li>
                            </ul>
                            <ul className="list-unstyled menu-categories" id="topAccordion">
                                <li className="menu single-menu">
                                    <a href="index.html">
                                        <div >
                                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                            <span>الرئيسية</span>
                                        </div>
                                    </a>
                                </li>
                                <li className="menu single-menu">
                                    <a href="visits.html">
                                        <div >
                                            <i className="far fa-calendar-exclamation fa-lg ml-2" />
                                            <span>الزيارات</span>
                                        </div>
                                    </a>
                                </li>
                                <li className="menu single-menu">
                                    <a href="doctor.html">
                                        <div >
                                            <i className="far fa-user-md fa-lg ml-2" />
                                            <span>الاطباء</span>
                                        </div>
                                    </a>
                                </li>
                                <li className="menu single-menu">
                                    <a href="patient.html">
                                        <div >
                                            <i className="far fa-user-injured fa-lg ml-2" />
                                            <span>المرضى</span>
                                        </div>
                                    </a>
                                </li>
                                <li className="menu single-menu">
                                    <a href="package_test.html">
                                        <div >
                                            <i className="far fa-syringe fa-lg ml-2" />
                                            <span>التحاليل</span>
                                        </div>
                                    </a>
                                </li>
                                <li className="menu single-menu">
                                    <a href="worker.html">
                                        <div >
                                            <i className="far fa-users fa-lg ml-2" />
                                            <span>الاجازات</span>
                                        </div>
                                    </a>
                                </li>
                                <li className="menu single-menu">
                                    <a href="invoice.html">
                                        <div >
                                            <i className="far fa-file-invoice fa-lg ml-2" />
                                            <span>الفورمة</span>
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </ul>
                <ul className="navbar-item flex-row nav-dropdowns mr-auto">
                    <li className="nav-item user-profile-dropdown order-lg-0 order-1">
                        <Link
                            to="/login"
                            className="nav-link dropdown-toggle user logout"
                            id="user-profile-dropdown"
                        >
                            <div className="media">
                                <i className="fas fa-sign-out-alt text-primary mt-2" />
                                <p
                                    style={{
                                        paddingRight: 14,
                                        fontFamily: '"Cairo"',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        marginBottom: 1
                                    }}
                                >
                                    تسجيل خروج
                                </p>
                            </div>
                        </Link>
                    </li>

                </ul>
            </header>
        </div>
    )
}

export default Navbar