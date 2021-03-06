/**
 * Created by JetBrains PhpStorm.
 * User: seanmcgary
 * Date: 2/15/12
 * Time: 10:41 AM
 * To change this template use File | Settings | File Templates.
 */



var machine_temp = ''+
'{{#each machine}}'+
'<div class="row">'+
	'<div class="span12">'+
		'<h2>{{display_name}}</h2>'+
		'<table class="table table-condensed table-striped" alias="{{alias}}">'+
			'<thead>'+
				'<tr>'+
					'<th>Slot</th>'+
					'<th>Name</th>'+
					'<th>Price</th>'+
					'<th>Available</th>'+
					'<th>Actions</th>'+
				'</tr>'+
			'</thead>'+
			'<tbody>'+
				'{{#each this.slots}}'+
				'<tr>'+
					'<td>{{slot_num}}</td>'+
					'<td>{{item_name}}</td>'+
					'<td>{{item_price}}</td>'+
					'<td>{{available}}</td>'+
					'<td>' +
						'{{#compare this.available 0 operator="=="}}' +
						'<input type="button" class="btn btn-danger disabled" value="Empty">' +
						'{{else}}' +
						'<input type="button" class="btn btn-primary" btn-action="drop" slot_num="{{slot_num}}" value="Drop">' +
						'{{/compare}}' +
						'{{#if this.drink_admin}}' +
						'<input type="button" class="btn btn-info" btn-action="edit_slot" slot_num="{{slot_num}}" value="Edit">'+
						'{{/if}}' +
					'</td>'+
				'</tr>'+
				'{{/each}}'+
			'</tbody>'+
		'</table>'+
	'</div>'+
'</div>'+
'<hr>'+
'{{/each}}';

var manage_user_form = '' +
	'<h3 id="username">{{cn}}</h3>' +
	'<label class="form-inline"><span id="curr_credits">{{credits}}</span></label>' +
	'<input type="number" name="credits" id="credit_input" value="0" username="{{uid}}">' +
	'<select name="edit_type" id="edit_type">' +
		'<option value="add">Add Credits</option>' +
		'<option value="fixed">Fix Amount</option>' +
	'</select>' +
	'<input type="submit" value="Submit" class="btn btn-success">';

var user_drops = ''+
	'<div class="tab-content global-tab" tab_content_id="user_drops">' +
		'<h2>Your Drop History</h2>' +
		'<table class="table table-condensed table-striped">' +
			'<thead>' +
				'<tr>' +
					'<th>Time</th>'+
					'<th>Slot</th>'+
					'<th>Machine</th>'+
					'<th>Item Name</th>'+
					'<th>Item Price</th>'+
					'<th>Status</th>'+
				'</tr>'+
			'</thead>'+
			'<tbody>'+
				'{{#each drops}}' +
				'<tr>'+
					'<td>{{date_added}}</td>'+
					'<td>{{slot}}</td>'+
					'<td>{{display_name}}</td>'+
					'<td>{{item_name}}</td>'+
					'<td>{{current_item_price}}<td>'+
					'<td>{{status}}</td>'+
				'</tr>'+
				'{{/each}}' +
			'</tbody>'+
		'</table>'+
	'</div>';

var machine_items = ''+
'<table class="table table-condensed table-striped"">'+
	'<thead>'+
		'<tr>'+
			'<th>Item Name</th>'+
			'<th>Item Price</th>'+
			'<th>Actions</th>'+
		'</tr>'+
	'</thead>'+
	'<tbody>'+
		'{{#each items}}'+
		'<tr>'+
			'<td>{{item_name}}</td>'+
			'<td>{{item_price}}</td>'+
			'<td>'+
				'<input type="button" class="btn btn-primary" btn-action="edit_item" item_id="{{item_id}}" value="Edit">'+
				'<input type="button" class="btn btn-danger" btn-action="remove_item" item_id="{{item_id}}" value="Remove">'+
			'</td>'+
		'</tr>'+
		'{{/each}}'+
	'</tbody>'+
'</table>';

function process_machines(sel, machine_data) {



	// Because Handlebars is a WONDERFUL AND VERY USEFUL library, you need to
	// create a custom function for performing comparisons between things.
	// Use this just like you'd use any other block item. For example:
	//
	// {{#compare var1 var2}}
	//		run when true
	// {{else}}
	//		run when false
	// {{/compare}}
	//
	// Shamelessly stolen from:
	// http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/
	Handlebars.registerHelper('compare', function (lvalue, rvalue, options) {

		if (arguments.length < 3)
			throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

		operator = options.hash.operator || "==";

		var operators = {
			'==': function (l, r) { return l == r; },
			'===': function (l, r) { return l === r; },
			'!=': function (l, r) { return l != r; },
			'<': function (l, r) { return l < r; },
			'>': function (l, r) { return l > r; },
			'<=': function (l, r) { return l <= r; },
			'>=': function (l, r) { return l >= r; },
			'typeof': function (l, r) { return typeof l == r; }
		}

		if (!operators[operator])
			throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);

		var result = operators[operator](lvalue, rvalue);

		if (result) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}

	});


	// compile machines
	var machines = Handlebars.compile(machine_temp);
	machines = machines({machine: machine_data});

	sel.html(machines);

	$('input:button[btn-action="drop"]').on('click', function(){
		var slot_num = $(this).attr('slot_num'),
			machine_alias = $(this).parent().parent().parent().parent().attr('alias');

		pending_drop = {slot_num: slot_num, machine_alias: machine_alias};

		$('#drop_modal').modal({
			keyboard: false
		});

		$('#drop_modal').on('hidden', function(){
			pending_drop = null;
		});
	});

	$('input:button[btn-action="edit_slot"]').on('click', function(){
		var slot_num = $(this).attr('slot_num'),
			alias = $(this).parent().parent().parent().parent().attr('alias');

		Ext.Ajax.request({
			url: page_data.get_slot_data + '/' + slot_num + '/' + alias,
			success: function(response, opts){
				var obj = Ext.decode(response.responseText);

				if(obj.status == true){
					$('#edit_modal').modal();
					$('#edit_slot_num').html(obj.slot.slot_num);
					$('#edit_machine_name').html(obj.slot.display_name);

					$('#edit_slot_form').attr('slot_num', obj.slot.slot_num);
					$('#edit_slot_form').attr('machine_id', obj.slot.machine_id);

					var items = [];

					for(var i in obj.items){
						items.push(obj.items[i].item_name);
						$('#slot_item').append('<option value="' + obj.items[i].item_id + '"' + ((obj.items[i].item_id == obj.slot.item_id) ? 'selected' : '') + '>' + obj.items[i].item_name + '</option>');
					}

					$('#available').val(obj.slot.available);

					if(obj.slot.status == 'enabled'){
						$('#state opt4ion[value="enabled"]').attr('selected', 'true');
					} else {
						$('#state option[value="disabled"]').attr('selected', 'true');
					}

				}
			},
			failure: function(response, opts){

			}
		});
	});
}

function get_user_drops(selector){
	Ext.Ajax.request({
		url: page_data.user_drops,
		success: function(response, opts){
			var obj = Ext.decode(response.responseText);

			var drops = Handlebars.compile(user_drops);
			drops = drops({drops: obj});

			$('#user_drops').html(drops);
		},
		failure: function(response, opts){

		}
	})
}

function parse_items(item_list){
	var items = Handlebars.compile(machine_items);
	items = items({items: item_list});

	$('#drink_item_list').html(items);
}