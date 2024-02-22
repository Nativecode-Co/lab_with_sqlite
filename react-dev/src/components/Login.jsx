import { useRef } from 'react';
// import form-2.css
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/css/authentication/form-2.css';

import '../assets/plugins/font-awesome/css/all.css';

import logo from '../assets/image/flask.png';

const Login = () => {

    return (
        <div className="form-container outer">
            <div className="form-form">
                <div className="form-form-wrap">
                    <div className="form-container">
                        <div className="form-content">
                            <div className="row justify-content-center">
                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-8 layout-spacing">
                                    <div className="widget-table-three">
                                        <img src={logo} alt="logo1" width="100%" />
                                        {/* <div class="page-title w-100 text-center mt-5">
                                  <h1>Unilab System</h1>
                              </div> */}
                                    </div>
                                </div>
                            </div>
                            <h1 className="">
                                {" "}
                                تسجيل الدخول <i className="fas fa-sign-in-alt" />
                            </h1>
                            <p className="h-22">يرجى ادخال معلومات الحساب ادناه</p>
                            <form className="text-left" id="form-login">
                                <div className="form">
                                    <div id="username-field" className="field-wrapper input text-right">
                                        <label htmlFor="username" className="h-22">
                                            اسم الحساب
                                        </label>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="feather feather-user mt-3"
                                        >
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx={12} cy={7} r={4} />
                                        </svg>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            className="form-control"
                                            placeholder="اسم الحساب"
                                        />
                                    </div>
                                    <div id="password-field" className="field-wrapper input mb-2">
                                        <div className="d-flex justify-content-between">
                                            <label htmlFor="password" className="h-22">
                                                الرمز السري
                                            </label>
                                        </div>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="feather feather-lock mt-3"
                                        >
                                            <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            className="form-control"
                                            placeholder="الرمز السري"
                                        />
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            id="toggle-password"
                                            className="feather feather-eye mt-3"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx={12} cy={12} r={3} />
                                        </svg>
                                    </div>
                                </div>
                            </form>
                            <div id="message" className="text-danger h-22 my-3"></div>
                            <div className="d-sm-flex justify-content-center">
                                <div className="field-wrapper">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onclick="fireSwal(login)"
                                        value=""
                                    >
                                        تسجيل الدخول <i className="fas fa-sign-in-alt" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Login