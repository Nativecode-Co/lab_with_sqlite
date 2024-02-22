import { useState } from "react";
import Select from "../../components/form/Select";
import { genders } from "../../constant/options";
import { useForm } from "react-hook-form";
import { Row, Col } from "react-bootstrap";

const defaultData = {
  patient: "",
  name: "",
  visit_date: new Date().toISOString().slice(0, 10),
  age_year: 0,
  age_month: 0,
  age_day: 0,
  address: "",
  phone: "",
  gender: "ذكر",
  doctor_hash: "",
  note: "",
  net_price: 0,
  total_price: 0,
  discount: 0,
  tests: [],
};

const VisitForm = ({ hash, setHash }) => {
  const {
    handleSubmit,
    setValue,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: defaultData,
  });

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState(false);

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="statbox widget box box-shadow bg-white main-visit-form text-right h-100">
      <div className="widget-content widget-content-area m-auto">
        <div className="modal-header d-flex justify-content-center">
          <h5 className="modal-title" id="modal-lab_visits">
            اضافة مريض
          </h5>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Row className="justify-content-sm-between m-3">
              <Col md={3}>
                <label className="h5 d-inline">
                  {newPatient ? "مريض جديد" : "مريض قديم"}
                </label>
                <label className="d-inline switch s-icons s-outline s-outline-invoice-slider mr-2">
                  <input
                    type="checkbox"
                    name="new_patient"
                    defaultChecked=""
                    onClick={(e) => {
                      setNewPatient(e.target.checked);
                      if (e.target.checked) {
                        setValue("patient_id", "");
                      }
                    }}
                  />
                  <span className="invoice-slider slider" />
                </label>
              </Col>
              <div className="w-100 mt-3"></div>
              <Col md={3}>
                {/* اسم المريض */}
                <div className="form-group" id="name-form">
                  <label htmlFor="name">اسم المريض</label>
                  {newPatient ? (
                    <input
                      type="text"
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      id="name"
                      placeholder="اسم المريض"
                      {...register("name", { required: true })}
                    />
                  ) : (
                    <Select
                      error={errors.patient}
                      options={[]}
                      placeholder="المريض"
                      {...register("patient", { required: true })}
                    />
                  )}
                </div>
              </Col>
              <Col md={3}>
                {/* تاريخ الزيارة */}
                <div className="form-group">
                  <label htmlFor="visit_date">تاريخ الزيارة</label>
                  <input
                    type="date"
                    className={`form-control ${
                      errors.visit_date ? "is-invalid" : ""
                    }`}
                    id="visit_date"
                    placeholder="تاريخ الزيارة"
                    {...register("visit_date", { required: true })}
                  />
                </div>
              </Col>
              <Col md={2}>
                {/* العمر بالسنين */}
                <div className="form-group">
                  <label htmlFor="age_year">العمر بالسنين</label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.age_year ? "is-invalid" : ""
                    }`}
                    id="age_year"
                    placeholder="العمر بالسنين"
                    {...register("age_year", { required: true })}
                  />
                </div>
              </Col>
              <Col md={2}>
                <div className="form-group">
                  <label htmlFor="age_month">العمر بالشهور</label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.age_month ? "is-invalid" : ""
                    }`}
                    id="age_month"
                    placeholder="العمر بالشهور"
                    {...register("age_month", { required: true })}
                  />
                </div>
              </Col>
              <Col md={2}>
                <div className="form-group">
                  <label htmlFor="age_day">العمر بالايام</label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.age_day ? "is-invalid" : ""
                    }`}
                    id="age_day"
                    placeholder="العمر بالايام"
                    {...register("age_day", { required: true })}
                  />
                </div>
              </Col>
              <Col md={3}>
                <div className="form-group">
                  <label htmlFor="address">العنوان</label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.address ? "is-invalid" : ""
                    }`}
                    id="address"
                    placeholder="العنوان"
                    {...register("address", { required: true })}
                  />
                </div>
              </Col>
              <Col md={3}>
                <div className="form-group">
                  <label htmlFor="phone">رقم الهاتف</label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.phone ? "is-invalid" : ""
                    }`}
                    id="phone"
                    placeholder="رقم الهاتف"
                    {...register("phone", { required: true })}
                  />
                </div>
              </Col>
              <Col md={3}>
                <div className="form-group">
                  <label htmlFor="gender">الجنس</label>
                  <Select
                    error={errors.gender}
                    options={genders}
                    placeholder="الجنس"
                    {...register("gender", { required: true })}
                  />
                </div>
              </Col>
              <Col md={3}>
                <div className="form-group" id="doctor_hash-form">
                  <label htmlFor="doctor_hash">الطبيب</label>
                  <Select
                    error={errors.doctor_hash}
                    options={[]}
                    placeholder="الطبيب"
                    {...register("doctor_hash", { required: true })}
                  />
                </div>
              </Col>
              <Col md={12}>
                <div className="form-group" id="doctor_hash-form">
                  <label htmlFor="doctor_hash">التحاليل</label>
                  <Select
                    error={errors.doctor_hash}
                    options={genders}
                    placeholder="التحاليل"
                    {...register("tests", { required: true })}
                    isMulti
                  />
                </div>
              </Col>
              <Col md={12}>
                <div className="form-group" id="doctor_hash-form">
                  <label htmlFor="doctor_hash">العروض</label>
                  <Select
                    error={errors.doctor_hash}
                    options={genders}
                    placeholder="العروض"
                    {...register("tests", { required: true })}
                    isMulti
                  />
                </div>
              </Col>
              <Col md={12}>
                <div className="form-group">
                  <label htmlFor="note">ملاحظات</label>
                  <textarea
                    className="form-control"
                    id="note"
                    style={{ fontSize: 14 }}
                    rows={3}
                    placeholder="ملاحظات"
                    {...register("note", { required: false })}
                  />
                </div>
              </Col>
              <Col md={12}>
                <button
                  type="submit"
                  className="btn btn-main-add w-100"
                  hash="lab_visits-save"
                >
                  حفظ
                </button>
              </Col>
            </Row>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VisitForm;
