<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Room extends Model
{
    protected $fillable=[
        'room_no',
        'room_type',
        'bed_count',
        'is_available',
        'max_occupancy',
        'features',
        'price_perNight',
        'image'

    ];

    protected $appends=[
      'cover_image_url'
    ];

    public function getCoverImageUrlAttribute(): ?string
    {
        return $this->cover_image ? Storage::url($this->cover_image) : null;
    }

}
