import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    await axiosInstance
      .get('/fetch-orders')
      .then((response) => {
        setOrders(response.data.reverse());
      })
      .catch((err) => {
        console.log(err);
        toast.error('Failed to load orders');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="orderPage">
      <div className="all-orders-container">
        <div className="all-orders-container-head">
          <h2>Platform Orders Audit</h2>
          <span className="badge bg-primary fs-6">{orders.length} Orders</span>
        </div>

        {loading ? (
          <div className="p-4 text-center text-muted">Loading orders ledger...</div>
        ) : orders.length === 0 ? (
          <div className="p-4 text-center text-muted">No orders found on the platform.</div>
        ) : (
          <div className="all-orders">
            {orders.map((order) => {
              return (
                <div className="all-orders-stock" key={order._id}>
                  <span>
                    <h5 className="text-muted small mb-1">Symbol</h5>
                    <p className="fw-bold mb-0 text-dark">{order.symbol}</p>
                  </span>
                  <span>
                    <h5 className="text-muted small mb-1">Company</h5>
                    <p className="mb-0">{order.name}</p>
                  </span>
                  <span>
                    <h5 className="text-muted small mb-1">Shares</h5>
                    <p className="mb-0">{order.count}</p>
                  </span>
                  <span>
                    <h5 className="text-muted small mb-1">Execution Price</h5>
                    <p className="mb-0">${Number(order.price).toFixed(2)}</p>
                  </span>
                  <span>
                    <h5 className="text-muted small mb-1">Total Value</h5>
                    <p className="fw-bold mb-0">${Number(order.totalPrice).toLocaleString()}</p>
                  </span>
                  <span>
                    <h5 className="text-muted small mb-1">Action</h5>
                    <span className={`order-badge ${order.orderType?.toLowerCase()}`}>
                      {order.orderType || 'Buy'}
                    </span>
                  </span>
                  <span>
                    <h5 className="text-muted small mb-1">Status</h5>
                    <span className="badge bg-success-subtle text-success">
                      {order.orderStatus || 'Completed'}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrders;
