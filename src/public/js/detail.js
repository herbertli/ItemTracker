document.addEventListener('DOMContentLoaded', main);

function main() {

    $('#accordion').collapse();

    $('.modal').modal({
        show: false,
        keyboard: false
    });

    var submit = document.getElementById('addItem');
    submit.addEventListener('click', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        $('#add-modal').modal('hide');
        var itemTitle = document.getElementById('itemTitle').value;
        var itemDesc = document.getElementById('itemDesc').value;
        var itemQuantity = document.getElementById('itemQuantity').value;
        var locationTitle = document.getElementById('locationTitle').value;

        var req = new XMLHttpRequest();
        var url = "/api/location/" + locationTitle + "/addItem";
        req.open("POST", url, true);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        req.addEventListener('load', function () {
            if (req.status != 200) {
                var res = JSON.parse(req.responseText);
                var message = res.error;
                $('#alert-msg')
                    .append(
                        '<div class="alert alert-danger fade in alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true"><i class="material-icons">clear</i></span> </button> <strong>Error!</strong> '+message+' </div>'
                    );
            } else {
                var data = JSON.parse(req.responseText);
                console.log(data);
                var title = data.newItem.title;
                var description = data.newItem.description;
                var quantity = data.newItem.quantity;
                var slug = data.newItem.slug;
                var id = data.newItem._id;
                var locationTitle = document.getElementById('locationTitle').value;
                var allLocations = '<select name="moveLocationId" class="form-control">' + data.locations.reduce(function (a, obj) {
                    return a + '<option>' + obj.title + '</option>';
                }, '') + '</select>';
                var locationTitle = document.getElementById('locationTitle').value;
                document.getElementById('alert-msg').innerHTML = "";
                $('#accordion').append(
                    $('<div class="panel panel-default"></div>')
                        .append(
                            $('<div class="panel-heading" role="tab" id="heading"' + slug + '></div>')
                                .append(
                                    $('<h4 class="panel-title"></h4>')
                                        .append(
                                            $('<a class="collapsed" role="button" data-toggle="collapse" href="#collapse' + slug + '" aria-expanded="false" aria-controls="collapse' + slug + '">')
                                                .append(
                                                    $('<i class="material-icons">folder</i>')
                                                )
                                                .append(title)
                                        )
                                )
                        )
                        .append(
                            $('<div id="collapse' + slug + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading'+ slug +'">')
                                .append(
                                    $('<ul class="list-group"></ul>')
                                        .append(
                                            $('<li class="list-group-item"><form class="form-horizontal" method="POST" action="/updateItem"> <div class="form-group"> <label class="control-label col-md-2" for="locationDesc">Description</label> <div class="col-md-5"> <input type="text" class="form-control" name="itemDesc" id="itemDesc" value="'+description+'"> </div> <input type="hidden" name="locationTitle" id="locationTitle" value="'+locationTitle+'"> <input type="hidden" name="itemId" id="itemId" value="'+id+'"> </div> <div class="form-group"> <label class="control-label col-md-2" for="itemQuantity">Quantity</label> <div class="col-md-3"> <input type="number" class="form-control col-md-10" name="itemQuantity" id="itemQuantity" value="'+quantity+'"> </div> </div> <div class="form-group"> <div class="col-sm-offset-2 col-sm-10"> <button type="submit" class="btn btn-default">Update Item</button> </div> </div> </form> </li>')
                                        )
                                        .append(
                                            $('<li class="list-group-item container-fluid"></li>')
                                                .append(
                                                    $('<form method="POST" action="/location/'+locationTitle+'/moveItem">' +
                                                        '<input type="hidden" name="itemId" value="'+id+'">' +
                                                        '<div class="col-md-3">'+allLocations + '</div>' +
                                                        '<button class="btn btn-default pull-left" id="moveItem" type="submit" name="action">' +
                                                        'Move Item' +
                                                        '<i class="material-icons">check</i>' +
                                                        '</button>' +
                                                        '</form>')
                                                )
                                                .append(
                                                    $('<form method="POST" action="/location/'+locationTitle+'/deleteItem">' +
                                                        '<input type="hidden" name="itemId" value="'+id+'">' +
                                                        '<button class="btn btn-default pull-right" id="deleteItem" type="submit" name="action">' +
                                                        'Delete Item' +
                                                        '<i class="material-icons">close</i>' +
                                                        '</button>' +
                                                        '</form>')
                                                )
                                        )
                                )
                        )
                );
            }
            document.getElementById('itemTitle').value = "";
            document.getElementById('itemDesc').value = "";
            document.getElementById('itemQuantity').value = "";
        });
        req.send("itemTitle=" + itemTitle + "&itemDesc=" + itemDesc + "&itemQuantity=" + itemQuantity);
    });
}