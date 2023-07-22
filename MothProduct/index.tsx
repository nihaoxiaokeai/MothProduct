import * as React from "react";
import { Toast } from "antd-mobile";
import TableView from "components/TableView";
import EmptyView, { EmptyType } from "components/EmptyView";
import * as api from "@services/mothProduct";
import * as qs from "query-string";
import "./index.scss";

const columns = [
  { title: "区域及门店", width: "40%", key: "dataTypeName" },
  { title: "区域排名", width: "18%", key: "rankNo" },
  { title: "完成率", width: "20%", key: "finishRate" },
  { title: "临期撤柜数量", width: "22%", key: "removeNums" },
];



interface IProps {}

interface IState {
  reportDate: string;
  dataSource: any;
  columns: any;
  showModal: boolean;
}

class MonthProduct extends React.PureComponent<IProps, IState> {
  msgid: string;
  constructor(props: IProps) {
    super(props);
    const params = qs.parse(window.location.search);
    this.msgid = params.msgid;
    this.state = {
      dataSource: [],
      columns: columns,
      showModal: false,
      reportDate: "",
    };
  }

  // 获取大客户数据
    getMothdProductList = (param: any) => {
      Toast.loading("加载中....");
      api
        .getMothdProductList(param)
        .then((rs: any) => {
          Toast.hide();
          const dataList = rs.monthDataTypeList || [];
          dataList.map((item: any, index: number) => {
            Object.assign(item, {
              type: "yellow",
              ...item.expirationdatemonthDetail||{},
            })
            delete item.expirationdatemonthDetail
          });
          this.setState({ dataSource: dataList, reportDate: rs.reportDate });
        })
        .catch(() => {
          Toast.hide();
        });
    };

  handleList = (list: any, rowKey: any, expansion: boolean) => {
    return list.map((item: any) => {
      const { childList } = item;
      if (item.msgseq === rowKey) item.expansion = expansion;
      if (childList) {
        this.handleList(childList, rowKey, expansion);
      }
    });
  };

  // 展开数据
  onExpansion = (expansion: boolean, rowKey: any) => {
    const list = [...this.state.dataSource];
    this.handleList(list, rowKey, expansion);
    this.setState({ dataSource: list });
  };

  componentDidMount() {
    document.title = "临期商品预警月报";
    this.getMothdProductList({ msgid: this.msgid });
  }

  // 渲染
  render() {
    const { columns = [], dataSource = [],reportDate } = this.state;
    return (
      <>
        {dataSource.length === 0 ? (
          <EmptyView
            emptyType={EmptyType.emptyTypeNone}
            tipImage={require("assets/images/icon_nodata.png")}
          />
        ) : (
          <div className="month-product-container">
              <div className="date-text">{reportDate}</div>
            <TableView
              className="table-view"
              columns={columns}
              dataList={dataSource}
              onExpansion={this.onExpansion}
              rowKey="msgseq"
              scrollX={window.screen.width - 20}
              fixed
            />
          </div>
        )}
      </>
    );
  }
}

export default MonthProduct;
