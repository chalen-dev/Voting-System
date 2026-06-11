<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Vote IP Hash Salt
    |--------------------------------------------------------------------------
    |
    | Environmental salt mixed into the SHA-256 hash of a voter's gateway IP
    | address before it is stored. Hashing the IP preserves voter anonymity,
    | while the salt prevents trivial rainbow-table reversal of the hash back
    | to a raw IP. Set VOTE_SALT to a long, random, secret value per deployment.
    |
    */

    'ip_salt' => env('VOTE_SALT', ''),

];
