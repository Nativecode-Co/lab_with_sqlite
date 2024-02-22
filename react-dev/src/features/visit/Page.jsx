import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import Form from "./Form";
import Table from "./Table";

export default function Visit() {
  const [hash, setHash] = useState(null);

  return (
    <>
      <Row className="pt-4">
        <Col lg={7}>
          <Form hash={hash} setHash={setHash} />
        </Col>
        <Col lg={5}>
          <Table setHash={setHash} />
        </Col>
      </Row>
    </>
  );
}
