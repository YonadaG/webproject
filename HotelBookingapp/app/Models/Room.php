<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable=[
        'room_no',
        'room_type',
        'bed_count',
        'is_available',
        'max_occupancy',
        'features',
        'price_perNight'

    ];

}
