import { Table as AntTable } from "antd";
import Empty from "./Empty";

const Table = ({
  columns,
  data,
  total,
  dispatch,
  isLoading = false,
  height = "",
}) => {
  const onShowSizeChange = (current, pageSize) => {
    dispatch({
      type: "CHANGE_PAGE_AND_ROWS_PER_PAGE",
      payload: { page, rowsPerPage: pageSize },
    });
  };
  return (
    <AntTable
      className="table-striped m-3"
      pagination={{
        total: total,
        showSizeChanger: true,
        onShowSizeChange: onShowSizeChange,
        onChange: (page, pageSize) => {
          onShowSizeChange(page, pageSize);
        },
      }}
      style={{
        overflowX: "auto",
        overflowY: "auto",
        height: height,
      }}
      locale={{
        emptyText: <Empty />,
      }}
      columns={columns}
      dataSource={data}
      rowKey={(index) => {
        return index.hash;
      }}
      loading={isLoading}
    />
  );
};

export default Table;
