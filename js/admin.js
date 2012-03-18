/**
 * Created by JetBrains PhpStorm.
 * User: seanmcgary
 * Date: 2/15/12
 * Time: 10:09 AM
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function(){
    var charts = {};

    $('#admin-nav li > a').on('click', function(){
        console.log($(this));

        if(!($(this).parent().hasClass('active'))){
            $('#admin-nav li.active').removeClass('active');

            $(this).parent().addClass('active');

            $('.admin-page').css('display', 'none');

            $('.admin-page#' + $(this).attr('page_id')).css('display', 'block');
        }
        return false;
    });

    $('#search_user').on('submit', function(){
        var results = $('#search_user_results');
        if($('#username').val().length > 0){
            Ext.Ajax.request({
                url: page_data.search_user,
                form: 'search_user',
                success: function(response, opts){
                    var obj = Ext.decode(response.responseText);

                    if(obj.status == 'true'){
                        var form = Handlebars.compile(manage_user_form);
                        form = form(obj.user);

                        results.find('#username_header').html(obj.user.cn);
                        results.find('#curr_credits').html(obj.user.credits);
                        results.find('#credit_input').attr('username', obj.user.uid);
                        $('#search_user_results').css('display', 'block');

                    } else {
                        console.log('error');
                    }

                },
                failure: function(response, opts){

                }
            });
        } else {

        }

        return false;
    });

    $('#manage_user_form').on('submit', function(){

        if($('#credit_input').val().length > 0){

            var uid = $('#credit_input').attr('username');

            Ext.Ajax.request({
                url: page_data.edit_credits,
                form: 'manage_user_form',
                success: function(response, opts){
                    var obj = Ext.decode(response.responseText);

                    if(obj.status == 'true'){
                        $('#curr_credits').html(obj.credits);
                        if(window.current_user == uid){
                            $('#credits').html(obj.credits);
                        }

                    } else {
                        //console.log('error');
                    }
                },
                failure: function(response, opts){

                },
                params: {uid: uid}
            });
        } else {

        }

        return false;
    });

    $('#save_edit_slot').on('click', function(){
        var form = $('#edit_slot_form'),
            form_data = {
                slot_num: $('#edit_slot_form').attr('slot_num'),
                machine_id: $('#edit_slot_form').attr('machine_id'),
                item_id: $('#slot_item').val(),
                available: $('#available').val(),
                state: $('#state').val()
            };

        Ext.Ajax.request({
            url: page_data.save_slot_data,
            success: function(response, opts){
                var obj = Ext.decode(response.responseText);

                if(obj.status == 'true'){
                    process_machines($('#machines'), obj.machines);
                    get_user_drops($('#user_drops'));
                    $('#edit_modal').modal('hide');
                } else {
                    //console.log('fail');
                }
            },
            failure: function(response, opts){

            },
            params: form_data
        });

    });

    // get the machines to make the graphs
    $.ajax({
        url: get_machines,
        dataType: 'json',
        success: function(data){
            if(data.status == true){
                for(var i = 0; i < data.machines.length; i++){

                    var machine = data.machines[i];
                    console.log(machine);
                    $.ajax({
                        url: get_temps + machine.machine_id,
                        dataType: 'json',
                        async: false,
                        success: function(temp_data){
                            if(temp_data.status == true){
                                console.log(temp_data);
                                var tmp = new Highcharts.Chart({
                                    chart: {
                                        renderTo: temp_data.name + '_temps',
                                        type: 'line'
                                    },
                                    title: {
                                        text: machine.display_name
                                    },
                                    yAxis: {
                                        title: {
                                            text: 'Temperature'
                                        }
                                    },
                                    series: [
                                        {
                                            name: machine.display_name,
                                            data: temp_data.temp
                                        }
                                    ]
                                });
                            }
                        }
                    });
                }
            }
        }
    });
});