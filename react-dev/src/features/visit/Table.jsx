import Table from "../../components/table/Table";
import React, { useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import useTable from "../../hooks/useTable";

const VisitTable = ({ setHash }) => {
  const [state, dispatch] = useTable();
  const [visits, setVisits] = useState([]);
  const [total, setTotal] = useState(0);
  const [today, setToday] = useState(false);

  const handelDeleteVisitByHash = (hash) => {};

  const columns = [
    {
      title: "المريض",
      dataIndex: "name",
      key: "name",
      className: "text-center",
    },
    {
      title: "التاريخ",
      dataIndex: "visit_date",
      key: "visit_date",
      className: "text-center",
    },
    {
      title: "الاجراء",
      dataIndex: "null",
      className: "text-center",

      render: (text, record) => (
        <>
          <button type="button" className="btn-action add" title="عرض الزيارة">
            <i className="far fa-eye" />
          </button>
          <button
            className="btn-action add"
            title="تعديل الزيارة"
            onClick={() => {
              setHash(record.hash);
            }}
            type="button"
          >
            <i className="far fa-edit" />
          </button>
          <button
            type="button"
            className="btn-action delete"
            title="حذف الزيارة"
            onClick={() => {
              handelDeleteVisitByHash(record.hash);
            }}
          >
            <i className="far fa-trash-alt" />
          </button>
        </>
      ),
    },
  ];

  return (
    <div
      className="statbox widget box box-shadow bg-white main-visit-list"
      style={{ minHeight: "100%" }}
    >
      <div
        className="widget-content widget-content-area m-auto visits-tabble"
        style={{
          overflowY: "scroll",
        }}
      >
        <div className="modal-header d-flex justify-content-center">
          <h5 className="modal-title">قائمة الزيارات</h5>
        </div>
        <Row className="m-3">
          <Col sm={12} md={6} className=" d-flex">
            <span className="h-22 ml-4 mt-1">الكل</span>
            <label className="d-inline switch s-icons s-outline s-outline-invoice-slider mx-3 mt-2">
              <input
                type="checkbox"
                name="currentDay"
                id="currentDay"
                defaultChecked=""
                onClick={(e) => {
                  setToday(e.target.checked);
                }}
              />
              <span className="invoice-slider slider" />
            </label>
            <span className="h-22 mt-1">اليوم</span>
          </Col>
        </Row>
        <Table
          columns={columns}
          data={visits}
          dispatch={dispatch}
          isLoading={false}
          total={total}
          height="100%"
        />
      </div>
    </div>
  );
};

export default VisitTable;
