document.addEventListener('DOMContentLoaded', main);

function main() {

    $('#accordion').collapse();

    $('.modal').modal({
        show: false,
        keyboard: false
    });

    renderGraph();
    var submit = document.getElementById('addLocation');
    submit.addEventListener('click', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        $('#add-modal').modal('hide');
        var locationTitle = document.getElementById('locationTitle').value;
        var locationDesc = document.getElementById('locationDesc').value;
        var req = new XMLHttpRequest();
        var url = "/api/addLocation";
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
                var title = data.title;
                var description = data.description;
                var id = data._id;
                document.getElementById('alert-msg').innerHTML = "";
                $('#accordion').append(
                    $("<div></div>")
                        .addClass('panel panel-default')
                        .append(
                            $("<div></div>")
                                .addClass("panel-heading")
                                .attr("role", "tab")
                                .attr("id", "heading" + id)
                                .append(
                                    $("<h4></h4>")
                                        .addClass("panel-title")
                                        .append(
                                            $("<a></a>")
                                                .attr("role", "button")
                                                .attr("data-toggle", "collapse")
                                                .attr("href", "#collapse" + id)
                                                .attr("aria-expanded", "false")
                                                .attr("aria-controls", "collapse" + id)
                                                .addClass("collapsed")
                                                .append(
                                                    $("<i></i>")
                                                        .addClass("material-icons")
                                                        .text("home")
                                                )
                                                .append("" + title)
                                        )
                                        .append(
                                            $("<a></a>")
                                                .attr("href", "/detail/" + title)
                                                .addClass("pull-right")
                                                .append(
                                                    $("<i></i>")
                                                        .addClass("material-icons")
                                                        .text("arrow_forward")
                                                )
                                        )
                                )
                        )
                        .append(
                            $("<div></div>")
                                .addClass("panel-collapse collapse")
                                .attr("id", "collapse" + id)
                                .attr("role", "tabpanel")
                                .attr("aria-labelledby", "heading" + id)
                                .append(
                                    $("<div></div>")
                                        .addClass("panel-body")
                                        .append(
                                            $("<p></p>")
                                                .text(description)
                                        )
                                )
                        )
                );

                document.getElementById("locationTitle").value = "";
                document.getElementById("locationDesc").value = "";
                document.getElementById("graph").innerHTML = "";
                renderGraph();
            }
        });
        req.send("locationTitle=" + locationTitle + "&locationDesc=" + locationDesc);

    });
}

function renderGraph() {

    var width = $("#headingOne").width();
    var height = .5 * width;

    var svg = d3.select("#graph")
        .append("svg:svg")
            .attr("width", width)
            .attr("height", height)
            .attr("pointer-events", "all");

    var simulation = d3.forceSimulation()
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink().id(function (d) {
            return d.title;
        }));

    var graph = {};

    d3.json("/api/getData", function (error, json) {
        if (error) throw error;
        graph.links = [];
        graph.nodes = json.locations.reduce(function (prev, loc) {
            var locationNode = {};
            locationNode.title = loc.title;
            locationNode.type = 0;
            prev = prev.concat(locationNode);
            var items = [];
            loc.items.forEach(function (item) {
                var itemNode = {};
                itemNode.title = item.title;
                itemNode.type = 1;
                items.push(itemNode);
                graph.links.push({
                    source: loc.title,
                    target: item.title
                });
            });
            return prev.concat(items);
        }, []);

        simulation
            .nodes(graph.nodes);

        simulation
            .force("link")
            .links(graph.links);

        var link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link");

        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node");

        node.append("image")
            .attr("href", function (d) {
                if (d.type === 0) {
                    return "/img/domain.png";
                }
                else {
                    return "/img/folder.png";
                }
            })
            .attr("x", -8)
            .attr("y", -8)
            .attr("width", 20)
            .attr("height", 20)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("text")
            .attr("dx", 16)
            .attr("dy", ".35em")
            .text(function (d) {
                return d.title
            });

        simulation.on("tick", function () {
            link.attr("x1", function (d) {
                return d.source.x;
            })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });
    });

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}