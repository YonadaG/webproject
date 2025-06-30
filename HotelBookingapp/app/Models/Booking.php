<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{

    protected $fillable = [
        'guest_id',
        'room_id',
        'check_in_date',
        'check_out_date',
        'number_of_guests',
        'status',
        'price',
        'payment_status',
    ];


    public function guest():BelongsTo{
        return $this->belongsTo(Guest::class);
 }
 public function room():BelongsTo{
        return $this->belongsTo(Room::class);
 }

}
