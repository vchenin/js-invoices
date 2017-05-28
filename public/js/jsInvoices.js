var module = angular.module('jsInvoices', []);

module.controller('mainController', ['$scope', '$http', function($scope, $http) {

    var emptyCustomer = {
        id: 0,
        name: '',
        address: '',
        phone: '',
    };

    var emptyInvoice = {
        id: 0,
        customer_id: 0,
        discount: 0,
        total: 0,
    };

    var emptyInvoiceItem = {
        id: 0,
        product_id: 0,
        quantity: 1,
    };

    var emptyProduct = {
        id: 0,
        name: '',
        price: 0,
    };

    $scope.navHistory = [];

    $scope.start = function() {
        $scope.getProducts();
        $scope.getCustomers();
        $scope.getInvoices();
        $scope.showPage('invoices');
    }

    $scope.$watch('currentCustomer', function(newValue, oldValue) {
        if (newValue != oldValue) {
            if ($scope.currentCustomer.id) {
                $scope.saveCustomer();
            }
        }
    }, true);

    $scope.$watch('currentInvoice', function(newValue, oldValue) {
        if (newValue != oldValue) {
            if ($scope.currentInvoice.id) {
                $scope.saveInvoice();
            }
            if (oldValue && newValue.discount != oldValue.discount) {
                $scope.updateTotal();
            }
        }
    }, true);

    $scope.$watch('currentInvoiceItems', function(newValue, oldValue) {
        if (newValue != oldValue) {
            for (var id in newValue) {
                if (oldValue && oldValue[id] 
                && (newValue[id].product_id != oldValue[id].product_id
                || newValue[id].quantity != oldValue[id].quantity)) {
                    $scope.saveInvoiceItem(id);
                }
            }
            $scope.updateTotal();
        }
    }, true);

    $scope.$watch('currentProduct', function(newValue, oldValue) {
        if (newValue != oldValue) {
            if ($scope.currentProduct.id) {
                $scope.saveProduct();
            }
        }
    }, true);

    $scope.backPage = function() {
        var lastPage = $scope.navHistory.pop();
        $scope.page = $scope.navHistory[$scope.navHistory.length - 1] || lastPage;
    };

    $scope.createCustomer = function() {
        $scope.currentCustomer = angular.copy(emptyCustomer);
        $http.post('/api/customers', $scope.currentCustomer)
        .then(function(res) {
            $scope.currentCustomer.id = res.data.id;
            $scope.getCustomers();
            $scope.showPage('customer-form');
        });
    }

    $scope.createProduct = function() {
        $scope.currentProduct = angular.copy(emptyProduct);
        $http.post('/api/products', $scope.currentProduct)
        .then(function(res) {
            $scope.currentProduct.id = res.data.id;
            $scope.getProducts();
            $scope.showPage('product-form');
        });
    }

    $scope.createInvoice = function() {
        $scope.currentInvoice = angular.copy(emptyInvoice);
        $scope.currentInvoiceItems = {};
        $http.post('/api/invoices', $scope.currentInvoice)
        .then(function(res) {
            $scope.currentInvoice.id = res.data.id;
            $scope.getInvoices();
            $scope.showPage('invoice-form');
        });
    }

    $scope.createInvoiceItem = function(product_id) {
        var invoiceItem = angular.copy(emptyInvoiceItem);
        invoiceItem.product_id = product_id;
        $http.post('/api/invoices/' + $scope.currentInvoice.id + '/items/', invoiceItem)
        .then(function(res) {
            $scope.getInvoiceItems();
        });
    }

    $scope.editCustomer = function(id) {
        $http.get('/api/customers/' + id)
        .then(function(res) {
            $scope.currentCustomer = res.data;
            $scope.showPage('customer-form');
        });
    }

    $scope.editProduct = function(id) {
        $http.get('/api/products/' + id)
        .then(function(res) {
            $scope.currentProduct = res.data;
            $scope.showPage('product-form');
        });
    }

    $scope.editInvoice = function(id) {
        $http.get('/api/invoices/' + id)
        .then(function(res) {
            $scope.currentInvoice = res.data;
            $scope.getInvoiceItems();
            $scope.showPage('invoice-form');
        });
    }

    $scope.getCustomers = function() {
        $http.get('/api/customers')
        .then(function(res) {
            var data = {};
            res.data.forEach(function (row) {
                data[row.id] = row;
            });
            $scope.customers = data;
        });
    };

    $scope.getInvoiceItems = function() {
        $http.get('/api/invoices/' + $scope.currentInvoice.id + '/items')
        .then(function(res) {
            var data = {};
            res.data.forEach(function (row) {
                data[row.id] = row;
            });
            $scope.currentInvoiceItems = data;
        });
    };

    $scope.getInvoices = function() {
        $http.get('/api/invoices')
        .then(function(res) {
            var data = {};
            res.data.forEach(function (row) {
                data[row.id] = row;
            });
            $scope.invoices = data;
        });
    };

    $scope.getProducts = function() {
        $http.get('/api/products')
        .then(function(res) {
            var data = {};
            res.data.forEach(function (row) {
                data[row.id] = row;
            });
            $scope.products = data;
        });
    };

    $scope.removeCustomer = function(id) {
        $http.delete('/api/customers/' + id)
        .then(function(res) {
            $scope.getCustomers();
        });
    };

    $scope.removeInvoice = function(id) {
        $http.delete('/api/invoices/' + id)
        .then(function(res) {
            $scope.getInvoices();
        });
    };

    $scope.removeInvoiceItem = function(id) {
        $http.delete('/api/invoices/' + $scope.currentInvoice.id + '/items/' + id)
        .then(function(res) {
            $scope.getInvoiceItems();
        });
    };

    $scope.removeProduct = function(id) {
        $http.delete('/api/products/' + id)
        .then(function(res) {
            $scope.getProducts();
        });
    };

    $scope.saveCustomer = function() {
        $http.put('/api/customers/' + $scope.currentCustomer.id, $scope.currentCustomer)
        .then(function(res) {
            $scope.getCustomers();
        });
    };

    $scope.saveInvoice = function() {
        $http.put('/api/invoices/' + $scope.currentInvoice.id, $scope.currentInvoice)
        .then(function(res) {
            $scope.getInvoices();
        });
    };

    $scope.saveInvoiceItem = function(id) {
        $http.put('/api/invoices/' + $scope.currentInvoice.id + '/items/' + id, $scope.currentInvoiceItems[id])
        .then(function(res) {
            // console.log(res.data);
        });
    };

    $scope.saveProduct = function() {
        $http.put('/api/products/' + $scope.currentProduct.id, $scope.currentProduct)
        .then(function(res) {
            $scope.getProducts();
        });
    };

    $scope.showPage = function(page) {
        if ($scope.navHistory[$scope.navHistory.length - 1] == page) {
            return;
        }
        $scope.navHistory.push(page);
        $scope.page = page;
        if ($scope.navHistory.length > 10) {
            $scope.navHistory.shift();
        }
    };

    $scope.updateTotal = function() {
        var total = 0;
        for (var id in $scope.currentInvoiceItems) {
            total += $scope.products[$scope.currentInvoiceItems[id].product_id].price * $scope.currentInvoiceItems[id].quantity;
        }
        total = total - total * ($scope.currentInvoice.discount / 100);
        $scope.currentInvoice.total = total.toFixed(2);
    };

}]);