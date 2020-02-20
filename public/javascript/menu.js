$(document).ready(function() {

    $('.add-item-btn').on('click', function() {
        var name = $(this).data('name');
        var price = Number.parseFloat($(this).data('price'));
        var quantity = parseFloat($(this).siblings('.amount').val());
        var totalPrice = Number.parseFloat(price * quantity);
        var formattedPrice = price.toFixed(2);
        var formattedTotal = totalPrice.toFixed(2);
        var cartCount = parseInt($('.cart-count').text());
        var newCount = cartCount + 1;
        if(quantity > 0) {
            $('.checkout-list').append('<li class="list-item checkout-item row"><div class="col-xs-3"><p class="font-weight-bold check-item-name">' + name + '</p></div><div class="col-xs-3 ml-3"><p class="font-weight-bold" checkout-item-price">$' + formattedPrice + '</p></div><div class="col-xs-3 ml-3"><p class="font-weight-bold check-item-quantity">' + quantity + '</p></div><div class="col-xs-3 ml-3"><p class="font-weight-bold checkout-item-total" data-nam="' + name + '" data-quant="' + quantity + '"data-pr="' + totalPrice + '">$' + formattedTotal + '   <button class="remove-btn close"><span>&times;</span></button></p></div></li>');
            var currentTotal = parseFloat($('.checkout-total').data('tot'));
            var newTotal = parseFloat(currentTotal + totalPrice).toFixed(2);
            $('.checkout-total').data('tot', newTotal);
            $('.checkout-total').text(newTotal);
            $('.cart-count').text(newCount);
        }
    });

    $('body').on('click', '.remove-btn', function() {
        var thisP = $(this).parent('p');
        var thisTotalPrice = parseFloat(thisP.data('pr'));
        var currentTotal = parseFloat($('.checkout-total').data('tot'));
        var newTotal = parseFloat(currentTotal - thisTotalPrice);
        var cartCount = parseInt($('.cart-count').text());
        var newCount = cartCount - 1;
        $('.cart-count').text(newCount);
        $('.checkout-total').data('tot', newTotal.toFixed(2));
        $('.checkout-total').text(newTotal.toFixed(2));
        var thisDiv = thisP.parent('div');
        thisDiv.parent().remove();
    });

    $('body').on('click', '#send-order-btn', function() {
        let items = [];
        if(!$('#user-first-name').val()) {
            alert('Must Enter Your First Name!');
            return;
        }
        if(!$('#user-last-name').val()) {
            alert('Must Enter Your Last Name!');
            return;
        }
        if(!$('#user-phone-number').val()) {
            alert('Must Enter Your Phone Number!');
            return;
        }
        if(!$('#user-address').val()) {
            alert('You Must Enter Your Address!');
            return;
        }
        if(!$('#user-city').val()) {
            alert('You Must Enter Your City Location!');
            return;
        }
        if(!$('#user-state').val()) {
            alert('You Must Enter Your State Location!');
            return;
        }
        let userFirstName = $('#user-first-name').val();
        let userLastName = $('#user-last-name').val();
        let userPhone = $('#user-phone-number').val();
        let userAddress = $('#user-address').val();
        let userCity = $('#user-city').val();
        let userState = $('#user-state').val();
        let userNotes = $('#user-notes').val();
        $('.checkout-item').each(function() {
            let itemName = $(this).find('.check-item-name').text();
            let itemPrice = $(this).find('.checkout-item-price').text();
            let itemQuantity = $(this).find('.check-item-quantity').text();
            let itemTotal = $(this).find('.checkout-item-total').text();
            items.push({
                itemName: itemName,
                itemPrice: itemPrice,
                itemQuantity: itemQuantity,
                itemTotalPrice: itemTotal
            });

        });
        let checkOutTotal = $('.checkout-total').text();
        $.ajax({
            url: '/handle-checkout',
            type: 'POST',
            data: JSON.stringify({orders: items, totalPrice: checkOutTotal, userInfo: {
                userFirstName: userFirstName,
                userLastName: userLastName,
                userPhone: userPhone,
                userAddress: userAddress,
                userCity: userCity,
                userState: userState,
                userNotes: userNotes
            }}),
            contentType: 'application/json',
            processData: false,
            cache: false,
            success: function(data) {
                if(data === 'success') {
                    alert('Order Successful');
                    $('#checkout-modal').modal('hide');
                    $('#userInfoModal').modal('hide');
                }
                else {
                    alert('Error Processing Order! Try Again!');
                }
            },
            error: function(err) {
                alert('Error Processing Order!', err.message);
            }
        });
    });

});
